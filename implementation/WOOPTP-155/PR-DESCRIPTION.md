# WOOPTP-155: Update Documentation

## Summary

Complete user-facing and developer documentation for the V2 API-driven flow, covering readme.txt for WordPress.org, REST API reference for developers, and a troubleshooting guide for support.

## Files

### New Files

1. **`readme.txt`** — WordPress.org plugin readme
   - Updated description for API-driven button creation
   - Installation instructions with PayPal Developer Dashboard steps
   - 8 FAQ entries covering credentials, currencies, backward compatibility, errors
   - Changelog for v0.8.0 with all new features
   - Screenshot descriptions (5 screenshots)
   - Upgrade notice

2. **`rest-api-reference.md`** — Developer documentation
   - All REST API endpoints with request/response examples
   - Connection management: connect, status, disconnect, environment switch
   - Button CRUD: create, list, get, update, delete
   - Complete block attributes table (13 attributes)
   - Error codes reference (10 error codes)
   - Authentication flow diagram (7 steps)
   - BN code attribution note

3. **`troubleshooting-guide.md`** — Support documentation
   - Connection issues: bad credentials, missing OpenSSL, network errors
   - Button creation issues: authorization, validation, business rules
   - Existing button issues: stale resources, legacy blocks, block recovery
   - API error reference table with actions
   - Environment switching guide
   - Credential storage explanation
   - Uninstall behavior

## Checklist

- [x] readme.txt updated with API-driven description
- [x] "Connect PayPal" section in installation instructions
- [x] FAQ with new flow questions (8 entries)
- [x] Changelog for v0.8.0
- [x] REST API endpoints documented (request/response)
- [x] OAuth connection flow documented
- [x] Block attributes documented (new + legacy)
- [x] Troubleshooting steps for connection, API errors, legacy blocks

Refs: WOOPTP-155
