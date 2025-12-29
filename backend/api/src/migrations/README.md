# Database Migrations

This directory contains TypeORM migrations for the Industrial Sensor Network backend.

## Running Migrations

### Development

During development, TypeORM is configured with `synchronize: true`, which means schema changes are automatically applied. However, for production deployments, you should use migrations.

### Generate a Migration

```bash
npm run typeorm migration:generate -- -n MigrationName
```

### Run Migrations

```bash
# Run all pending migrations
npm run typeorm migration:run

# Revert the last migration
npm run typeorm migration:revert
```

### Production

Migrations are automatically run during deployment via CI/CD pipeline.

## Migration: Rename Machines to Sensor Groups

**File**: `1735494000000-RenameMachinesToSensorGroups.ts`

This migration renames the `machines` table to `sensor_groups` and updates all related references:

- Renames `machines` table to `sensor_groups`
- Renames `machineId` column to `sensorGroupId` in `nodes` table
- Updates related indexes and foreign key constraints

**Impact**: This is a breaking change for any existing database instances. Ensure all application code is updated before running this migration.

**Rollback**: The migration includes a `down()` method to revert changes if needed.
