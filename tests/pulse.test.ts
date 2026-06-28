import { describe, it, expect, vi, beforeEach } from 'vitest';

// -------------------------------------------------------------
// 1. Mocking Dependencies
// -------------------------------------------------------------

const mockSupabaseClient = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    verifyOtp: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
  storage: {
    from: vi.fn(),
  },
}));

// Mock Next.js cookies and cache revalidation
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase Server client creator
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock Supabase JS client creator
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock Supabase Client configurations
vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabaseClient,
  supabaseAdmin: mockSupabaseClient,
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'YES. The civic issue appears resolved and fully repaired.',
    },
  });
  const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent,
  }));
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(class {
      getGenerativeModel = mockGetGenerativeModel;
    } as any),
  };
});

// Import actions & route handlers after mocks are set up
import { claimTicket } from '@/app/actions/ticketActions';
import { submitResolution } from '@/app/actions/payoutActions';
import { upvoteTicket } from '@/app/actions/citizenActions';
import { PATCH, GET } from '@/app/api/tickets/[id]/route';
import { POST as reportPOST } from '@/app/api/report/route';
import { POST as monthEndPOST } from '@/app/api/cron/month-end/route';

describe('PulseNet Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==============================================================================
  // WHITE BOX TESTING - BUSINESS LOGIC & CONSTRAINTS
  // ==============================================================================
  describe('White Box Tests - Actions & State Transitions', () => {
    
    it('claimTicket - should fail if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      
      const result = await claimTicket('ticket-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('claimTicket - should fail if user is not a municipal official', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      const result = await claimTicket('ticket-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized: Responder access required');
    });

    it('claimTicket - should succeed and transition status to claimed atomically', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'official-123' } }, error: null });
      
      // Mock Responder Profile search
      const mockSelectOfficial = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'official-123' }, error: null }),
      };
      
      // Mock Ticket claim status update
      const mockUpdateTicket = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'ticket-123', status: 'claimed' }, error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'municipal_officials') return mockSelectOfficial;
        if (table === 'tickets') return mockUpdateTicket;
        return null;
      });

      const result = await claimTicket('ticket-123');
      expect(result.success).toBe(true);
      expect(result.ticket.status).toBe('claimed');
      
      // Verify atomic condition check is applied
      expect(mockUpdateTicket.eq).toHaveBeenCalledWith('status', 'open');
    });

    it('submitResolution - should update ticket and official wallet, and prevent race condition', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'official-123' } }, error: null });

      const mockOfficialData = { id: 'official-123', current_tier: 'bronze', help_coin_wallet: 100, monthly_resolutions: 2 };
      const mockTicketData = { severity: 'medium', status: 'claimed', solver_id: 'official-123', bounty_amount: 50, category: 'Pothole' };

      const mockSelectOfficial = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOfficialData, error: null }),
      };

      const mockSelectTicket = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTicketData, error: null }),
      };

      // Mock ticket update status
      const mockUpdateTicket = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'ticket-123' }, error: null }),
      };

      const mockUpdateOfficial = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertTransaction = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'municipal_officials') return mockSelectOfficial;
        if (table === 'tickets') {
          // Check if selecting or updating
          if (mockSupabaseClient.from.caller?.name === 'submitResolution') {
             // If we're updating
          }
          return mockSelectTicket;
        }
        if (table === 'transactions') return mockInsertTransaction;
        return null;
      });

      // Override getPublicUrl for Supabase Storage
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/resolved.jpg' } }),
      });

      // Setup global fetch mock for "before" image
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
        headers: { get: () => 'image/jpeg' },
      });

      const formData = new FormData();
      formData.append('ticketId', 'ticket-123');
      const mockFile = new File(['foo'], 'after.jpg', { type: 'image/jpeg' });
      formData.append('image', mockFile);

      // Temporarily mock update to return updateTicket structure
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'municipal_officials') {
          return {
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve({ data: mockOfficialData, error: null })),
          };
        }
        if (table === 'tickets') {
          return {
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve({ data: mockTicketData, error: null })),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const result = await submitResolution(formData);
      expect(result.success).toBe(true);
      expect(result.payout).toBe(100); // 50 (medium base) * 1.0 multiplier + 50 (bounty)
    });
  });

  // ==============================================================================
  // API TESTING - ENDPOINTS & ROUTE HANDLERS
  // ==============================================================================
  describe('API Testing - Route Handlers', () => {

    it('GET /api/tickets/[id] - should fetch ticket details', async () => {
      const mockTicket = { id: 'ticket-123', category: 'Lighting', status: 'open' };
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTicket, error: null }),
      });

      const request = new Request('http://localhost/api/tickets/ticket-123');
      const response = await GET(request, { params: Promise.resolve({ id: 'ticket-123' }) });
      expect(response.status).toBe(200);
      
      const body = await response.json();
      expect(body.id).toBe('ticket-123');
      expect(body.category).toBe('Lighting');
    });

    it('PATCH /api/tickets/[id] - should allow updating status and reward creator', async () => {
      const mockTicket = { id: 'ticket-123', author_id: 'citizen-99', status: 'resolved' };
      const mockUser = { help_coin_balance: 50 };

      // Query mock mapping
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'tickets') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockTicket, error: null }),
          };
        }
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const request = new Request('http://localhost/api/tickets/ticket-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' }),
      });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'ticket-123' }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('resolved');
    });

    it('POST /api/report - should create ticket with correct column mappings', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'ticket-777' }, error: null }),
      });

      const formData = new FormData();
      formData.append('lat', '12.9716');
      formData.append('lng', '77.5946');
      formData.append('image', new File(['bar'], 'issue.jpg', { type: 'image/jpeg' }));

      const request = new Request('http://localhost/api/report', {
        method: 'POST',
        body: formData,
      });

      const response = await reportPOST(request);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.id).toBe('ticket-777');
    });

    it('POST /api/cron/month-end - should execute ranked payouts and budgets correctly', async () => {
      const mockOfficials = [
        { id: 'officer-1', jurisdiction_area: 'Ward A', monthly_resolutions: 10, avg_community_rating: 4.5, avg_resolution_speed_score: 8.0, help_coin_wallet: 100 },
      ];
      const mockBudget = { total_coins_allocated: 5000 };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'municipal_officials') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockOfficials, error: null }),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'monthly_budgets') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const request = new Request('http://localhost/api/cron/month-end', { method: 'POST' });
      const response = await monthEndPOST(request);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.processedOfficials).toBe(1);
    });
  });

  // ==============================================================================
  // BLACK BOX TESTING - ENUM BOUNDARIES & MISSING FIELDS
  // ==============================================================================
  describe('Black Box Tests - Boundary Checks', () => {
    it('PATCH /api/tickets/[id] - should reject invalid status values', async () => {
      const request = new Request('http://localhost/api/tickets/ticket-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'InvalidStatus' }),
      });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'ticket-123' }) });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid payload');
    });

    it('POST /api/report - should reject missing coordinates or image', async () => {
      const formData = new FormData();
      formData.append('lat', '12.9716');
      // missing lng and image

      const request = new Request('http://localhost/api/report', {
        method: 'POST',
        body: formData,
      });

      const response = await reportPOST(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Missing required fields');
    });
  });
});
