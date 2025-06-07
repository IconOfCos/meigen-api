import { describe, it, expect } from 'vitest';
import { corsOptions, corsMiddleware } from '../../src/middleware/cors.js';

describe('CORS Middleware Tests', () => {
  describe('corsOptions configuration', () => {
    it('should have correct origin configuration', () => {
      expect(corsOptions.origin).toEqual([
        'http://localhost:3000',
        'http://localhost:5173', 
        'http://localhost:8080'
      ]);
    });

    it('should have correct allowHeaders configuration', () => {
      expect(corsOptions.allowHeaders).toEqual([
        'X-Custom-Header',
        'Upgrade-Insecure-Requests',
        'Content-Type'
      ]);
    });

    it('should have correct allowMethods configuration', () => {
      expect(corsOptions.allowMethods).toEqual([
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS'
      ]);
    });

    it('should have correct exposeHeaders configuration', () => {
      expect(corsOptions.exposeHeaders).toEqual([
        'Content-Length',
        'X-Kuma-Revision'
      ]);
    });

    it('should have correct maxAge configuration', () => {
      expect(corsOptions.maxAge).toBe(600);
    });

    it('should have credentials enabled', () => {
      expect(corsOptions.credentials).toBe(true);
    });

    it('should contain all required CORS option properties', () => {
      const requiredProperties = [
        'origin',
        'allowHeaders', 
        'allowMethods',
        'exposeHeaders',
        'maxAge',
        'credentials'
      ];
      
      requiredProperties.forEach(prop => {
        expect(corsOptions).toHaveProperty(prop);
      });
    });
  });

  describe('corsMiddleware instance', () => {
    it('should be defined', () => {
      expect(corsMiddleware).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof corsMiddleware).toBe('function');
    });
  });

  describe('CORS configuration validation', () => {
    it('should include common development ports in origin', () => {
      const developmentPorts = ['3000', '5173', '8080'];
      const origins = corsOptions.origin;
      
      developmentPorts.forEach(port => {
        const hasPort = origins.some(origin => origin.includes(port));
        expect(hasPort).toBe(true);
      });
    });

    it('should include standard HTTP methods', () => {
      const standardMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
      const allowedMethods = corsOptions.allowMethods;
      
      standardMethods.forEach(method => {
        expect(allowedMethods).toContain(method);
      });
    });

    it('should include Content-Type in allowHeaders for API usage', () => {
      expect(corsOptions.allowHeaders).toContain('Content-Type');
    });
  });
});