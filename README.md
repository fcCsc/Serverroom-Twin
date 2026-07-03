# ServerRoomDigitalTwin

Phase 1 SharePoint Framework React TypeScript prototype for an app-like server room digital twin dashboard.

## Prototype scope

- Modern dark/glass dashboard UI
- Dummy rack and device data only
- Clickable racks and devices
- Right-side rack/device detail panel
- Search and status filter placeholders
- Bottom device inventory table
- Admin/settings placeholder for future SharePoint List names and column mapping

## Future SharePoint Lists

The prototype is designed to later read from SharePoint Lists named `Racks` and `Devices`.

Expected future `Racks` columns: `Title`, `RackId`, `Location`, `Row`, `RackNumber`, `TotalUnits`, `Status`.

Expected future `Devices` columns: `Title`, `DeviceId`, `RackId`, `UnitStart`, `UnitHeight`, `DeviceType`, `Status`, `Environment`, `Owner`, `Notes`.

Do not add real company data, IP addresses, serial numbers, tenant URLs, secrets, tokens, certificates, or credentials to this repository.

## Build

```bash
npm install
npm run build
```
