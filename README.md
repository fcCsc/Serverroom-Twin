# ServerRoomDigitalTwin

Phase 1 SharePoint Framework React TypeScript prototype for a 2D / 2.5D server room rack elevation dashboard.

## Prototype scope

- Modern dark/glass rack elevation navigator UI
- Dummy location, floor, rack and device data only
- Location → Floor → Rack navigation
- Accurate rack elevations using RackHeightU, top-to-bottom U labels, UPosition and UHeight
- Full, Half, Third and Quarter device mount widths with HorizontalSlot lane placement
- Front/Rear rack side toggle
- DeviceType visual markings for switch, server, firewall, storage, UPS and patch panel devices
- Right-side rack and device detail panel
- Bottom device inventory table with manufacturer, model, IP, VLAN, serial, warranty and maintenance responsible fields
- Admin/settings placeholder for visible column toggles and future SharePoint List column mapping

## Future SharePoint Lists

The prototype is designed to later read from SharePoint Lists named `Racks` and `Devices`.

Expected future `Racks` columns: `Title`, `RackId`, `Location`, `Floor`, `Row`, `RackNumber`, `TotalUnits`.

Expected future `Devices` columns: `Title`, `DeviceId`, `RackId`, `UnitStart`, `UnitHeight`, `DeviceType`, `RackSide`, `MountWidth`, `HorizontalSlot`, `Manufacturer`, `Model`, `IPAddress`, `VLAN`, `SerialNumber`, `WarrantyExpiry`, `MaintenanceResponsible`, `Environment`, `Owner`, `Notes`.

Do not add real company data, IP addresses, serial numbers, tenant URLs, secrets, tokens, certificates, or credentials to this repository.

## Build

```bash
npm install
npm run build
```
