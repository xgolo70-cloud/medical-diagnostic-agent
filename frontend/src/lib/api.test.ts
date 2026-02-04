/**
 * API Client Tests
 * 
 * Tests for the API client including authentication headers and profile updates.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetchResponse, mockFetchError, mockSupabaseClient, mockFetch } from '../test/setup';

// Import after mocks are set up
import { api } from './api';

describe('API Client', () => {
    
    describe('getHeaders', () => {
        
        it('should return headers with authorization token when session exists', async () => {
            const headers = await api.getHeaders();
            
            expect(headers).toHaveProperty('Content-Type', 'application/json');
            expect(headers).toHaveProperty('Authorization');
            expect(headers.Authorization).toContain('Bearer');
        });
        
        it('should return empty authorization when no session', async () => {
            // Mock no session
            mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
                data: { session: null },
                error: null,
            });
            
            const headers = await api.getHeaders();
            
            expect(headers.Authorization).toBe('');
        });
        
        it('should include content-type header', async () => {
            const headers = await api.getHeaders();
            
            expect(headers['Content-Type']).toBe('application/json');
        });
    });
    
    describe('updateUserProfile', () => {
        
        beforeEach(() => {
            vi.clearAllMocks();
        });
        
        it('should successfully update profile with full_name', async () => {
            mockFetchResponse({ 
                id: 'user-123',
                full_name: 'Updated Name',
                email: 'test@example.com'
            });
            
            const result = await api.updateUserProfile({ full_name: 'Updated Name' });
            
            expect(result).toEqual({
                id: 'user-123',
                full_name: 'Updated Name',
                email: 'test@example.com'
            });
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/me'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ full_name: 'Updated Name' }),
                })
            );
        });
        
        it('should successfully update profile with phone', async () => {
            mockFetchResponse({ 
                id: 'user-123',
                phone: '+1234567890'
            });
            
            const result = await api.updateUserProfile({ phone: '+1234567890' });
            
            expect(result.phone).toBe('+1234567890');
        });
        
        it('should successfully update profile with avatar_url', async () => {
            mockFetchResponse({ 
                id: 'user-123',
                avatar_url: 'https://example.com/avatar.jpg'
            });
            
            const result = await api.updateUserProfile({ 
                avatar_url: 'https://example.com/avatar.jpg' 
            });
            
            expect(result.avatar_url).toBe('https://example.com/avatar.jpg');
        });
        
        it('should update multiple fields at once', async () => {
            mockFetchResponse({ 
                id: 'user-123',
                full_name: 'New Name',
                phone: '+9876543210'
            });
            
            const result = await api.updateUserProfile({ 
                full_name: 'New Name',
                phone: '+9876543210'
            });
            
            expect(result.full_name).toBe('New Name');
            expect(result.phone).toBe('+9876543210');
        });
        
        it('should throw error on failed update', async () => {
            mockFetchError('Failed to update profile', 400);
            
            await expect(
                api.updateUserProfile({ full_name: 'Test' })
            ).rejects.toThrow('Failed to update profile');
        });
        
        it('should throw error on server error', async () => {
            mockFetchError('Internal server error', 500);
            
            await expect(
                api.updateUserProfile({ full_name: 'Test' })
            ).rejects.toThrow();
        });
        
        it('should throw error on unauthorized request', async () => {
            mockFetchError('Unauthorized', 401);
            
            await expect(
                api.updateUserProfile({ full_name: 'Test' })
            ).rejects.toThrow();
        });
        
        it('should include authorization header in request', async () => {
            mockFetchResponse({ id: 'user-123' });
            
            await api.updateUserProfile({ full_name: 'Test' });
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Bearer'),
                    }),
                })
            );
        });
        
        it('should send empty object when no data provided', async () => {
            mockFetchResponse({ id: 'user-123' });
            
            await api.updateUserProfile({});
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: '{}',
                })
            );
        });
    });
});

describe('API URL Configuration', () => {
    
    it('should use configured API URL', async () => {
        mockFetchResponse({ id: 'test' });
        
        await api.updateUserProfile({ full_name: 'Test' });
        
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('localhost:8000'),
            expect.any(Object)
        );
    });
});
