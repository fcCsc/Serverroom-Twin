# SharePoint list schema

This project expects two SharePoint lists for rack and device inventory data: `Racks` and `Devices`.

## Data safety for examples

Any sample values used in documentation, demos, seed files, screenshots, tests, or development environments must be dummy data only. Do not include real IP addresses, tenant URLs, credentials, secrets, tokens, or company data in sample content.

## `Racks` list

| Column | Purpose |
| --- | --- |
| `Title` | SharePoint item title for the rack record. |
| `RackId` | Stable unique identifier used to reference the rack. |
| `Location` | Dummy location label for where the rack is represented. |
| `Row` | Row identifier within the dummy room layout. |
| `RackNumber` | Rack number or position within the row. |
| `TotalUnits` | Total rack unit capacity, such as a dummy value of `42`. |
| `Status` | Current dummy lifecycle state, such as `Active`, `Reserved`, or `Offline`. |

## `Devices` list

| Column | Purpose |
| --- | --- |
| `Title` | SharePoint item title for the device record. |
| `DeviceId` | Stable unique identifier used to reference the device. |
| `RackId` or Rack lookup | Reference to the rack that contains the device. This may be stored as a text `RackId` value or implemented as a SharePoint lookup column to the `Racks` list. |
| `UnitStart` | Starting rack unit position for the device. |
| `UnitHeight` | Number of rack units occupied by the device. |
| `DeviceType` | Dummy device category, such as `Server`, `Switch`, `Storage`, or `PDU`. |
| `Status` | Current dummy lifecycle state, such as `Active`, `Planned`, or `Retired`. |
| `Environment` | Dummy environment label, such as `Development`, `Test`, or `Production-Like`. |
| `Owner` | Dummy owner, team, or role name. Do not use real people or company names. |
| `SerialNumber` | Dummy serial number only. Do not use real hardware identifiers. |
| `Notes` | Optional dummy notes for display or testing. Do not include sensitive or company-specific information. |
