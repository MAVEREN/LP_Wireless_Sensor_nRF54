# Testing Guide

Comprehensive testing strategy and procedures for the Industrial Sensor Network.

## Overview

The project implements multiple testing layers:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user workflow testing
- **Firmware Tests**: Embedded system testing
- **Manual Tests**: Hardware-in-loop testing

## Backend Testing

### Unit Tests

Located in `backend/api/src/modules/**/*.spec.ts`

#### Running Unit Tests

```bash
cd backend/api
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

#### Test Structure

```typescript
describe('TopologyService', () => {
  let service: TopologyService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TopologyService, ...mockProviders],
    }).compile();
    
    service = module.get<TopologyService>(TopologyService);
  });
  
  it('should create organization', async () => {
    const result = await service.createOrganization({ name: 'Test' });
    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
  });
});
```

#### Coverage Goals

- **Target**: 80% code coverage
- **Critical paths**: 100% coverage
- **Current**: 85% overall

### Integration Tests

Located in `backend/api/test/**/*.e2e-spec.ts`

#### Running Integration Tests

```bash
cd backend/api
npm run test:e2e
```

#### Test Structure

```typescript
describe('Topology E2E', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/api/topology/organizations (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/topology/organizations')
      .send({ name: 'Test Org' })
      .expect(201)
      .expect(res => {
        expect(res.body.name).toBe('Test Org');
      });
  });
});
```

## Web Application Testing

### E2E Tests with Playwright

Located in `apps/web/tests/e2e/**/*.spec.ts`

#### Running E2E Tests

```bash
cd apps/web

# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test tests/e2e/topology.spec.ts

# Debug mode
npx playwright test --debug
```

#### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Topology Management', () => {
  test('should display topology page', async ({ page }) => {
    await page.goto('/topology');
    
    await expect(page.getByText('Organizations')).toBeVisible();
    await expect(page.getByText('Sites')).toBeVisible();
    await expect(page.getByText('Machines')).toBeVisible();
  });
  
  test('should create new organization', async ({ page }) => {
    await page.goto('/topology');
    await page.click('button:text("New Organization")');
    
    await page.fill('input[name="name"]', 'Test Org');
    await page.click('button:text("Create")');
    
    await expect(page.getByText('Test Org')).toBeVisible();
  });
});
```

#### Test Coverage

Current Playwright tests cover:

- ✅ Topology management (3 tests)
- ✅ Fleet dashboard (3 tests)
- ✅ Local mode (3 tests)
- ✅ Commissioning wizard (3 tests)
- ✅ Navigation (3 tests)

**Total**: 15 test scenarios

### Visual Regression Testing

```bash
# Update snapshots
npx playwright test --update-snapshots

# Visual comparison
npx playwright test --reporter=html
```

## Firmware Testing

### Node Firmware Tests

#### Unit Tests (Host-based)

```bash
cd firmware/node_nrf54l15
west build -b native_posix -t run
```

#### Hardware-in-Loop Tests

```bash
# Flash firmware
west flash

# Run test suite
python scripts/test_node.py --serial /dev/ttyACM0
```

#### Test Cases

1. **Sensor Control**:
   - Power gating timing
   - ADC sampling accuracy
   - Calibration application
   - Fault detection

2. **BLE Operations**:
   - Advertisement format
   - GATT service discovery
   - Characteristic read/write
   - Notifications

3. **Configuration**:
   - NVS storage/retrieval
   - Config validation
   - Default values

4. **Power Management**:
   - Sleep current measurement
   - Wakeup timing
   - Watchdog behavior

### Hub Firmware Tests

#### BLE Central Tests

```bash
cd tools/test_hub
python test_hub.py --test-mode
```

#### Test Cases

1. **Scanning**:
   - Node discovery
   - RSSI tracking
   - Advertisement parsing

2. **Connection Management**:
   - Multi-connection handling
   - Connection pool limits
   - Reconnection logic

3. **Job Execution**:
   - Job queue
   - Retry logic
   - Timeout handling

4. **IPC Communication**:
   - Message framing
   - CRC validation
   - Error recovery

## Manual Testing

### Hardware Setup

1. **Node Testing**:
   - Flash node firmware
   - Connect sensor (0-5V input)
   - Monitor via RTT or UART
   - Verify sleep current (<10µA)

2. **Hub Testing**:
   - Flash hub firmware (BLE + cellular)
   - Connect to Azure IoT Hub
   - Discover nodes
   - Execute jobs

3. **End-to-End Flow**:
   - Commission node via web app
   - Assign to machine
   - Push config from cloud
   - Verify telemetry

### Test Scenarios

#### Scenario 1: Node Commissioning

1. Open web app → Local Mode
2. Click "Commission Node"
3. Scan for devices
4. Select node
5. Configure sampling parameters
6. Assign to machine
7. Verify node appears in fleet dashboard

**Expected**: Node commissioned and reporting data

#### Scenario 2: Remote Configuration

1. Open web app → Topology
2. Select machine with node
3. Update sampling interval
4. Submit job
5. Monitor job status
6. Verify new config applied

**Expected**: Configuration updated, node operating with new parameters

#### Scenario 3: Fault Detection

1. Disconnect sensor from node
2. Wait for sampling cycle
3. Check node status
4. Verify fault flag set
5. Check fleet dashboard shows fault

**Expected**: Fault detected and reported to cloud

## CI/CD Testing

### GitHub Actions Workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
  
  web-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test
  
  firmware-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: zephyrproject-rtos/action-zephyr-west@v1
      - run: west build -b nrf54l15pdk_nrf54l15_cpuapp
```

## Test Data

### Fixtures

Backend test fixtures in `backend/api/test/fixtures/`:

```typescript
export const mockOrganization = {
  id: 1,
  name: 'Test Org',
  created_at: new Date(),
};

export const mockNode = {
  id: 1,
  node_id: 'NODE-001',
  device_address: 'DC:A6:32:A3:F2:15',
  battery_level: 95,
  latest_reading: 23.5,
};
```

### Test Database

Use in-memory SQLite for integration tests:

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [...],
  synchronize: true,
})
```

## Performance Testing

### Load Testing

```bash
# Install k6
brew install k6  # macOS
apt install k6   # Linux

# Run load test
k6 run scripts/load-test.js
```

### Example Load Test

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/topology/organizations');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Security Testing

### Dependency Scanning

```bash
# Backend
cd backend/api
npm audit

# Web
cd apps/web
npm audit

# Fix vulnerabilities
npm audit fix
```

### CodeQL Analysis

Automated via GitHub Actions on every PR.

## Test Reports

### HTML Reports

- **Backend**: `backend/api/coverage/lcov-report/index.html`
- **Web E2E**: `apps/web/playwright-report/index.html`

### Coverage Reports

```bash
# Backend coverage
cd backend/api
npm run test:cov
open coverage/lcov-report/index.html

# Web coverage
cd apps/web
npm run test:coverage
```

## Best Practices

1. **Write tests first** (TDD) for new features
2. **Mock external dependencies** (Azure IoT Hub, database)
3. **Use descriptive test names** ("should create organization with valid data")
4. **Test edge cases** (null inputs, boundary values)
5. **Clean up after tests** (database, connections)
6. **Run tests in CI** before merging
7. **Maintain test data** separate from production
8. **Document test scenarios** for manual testing
9. **Review test coverage** regularly
10. **Update tests** when requirements change

## Troubleshooting

### Backend Tests Failing

```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Reset database
npm run migration:reset
```

### Playwright Tests Failing

```bash
# Update browsers
npx playwright install

# Clear cache
npx playwright clean

# Run in debug mode
npx playwright test --debug
```

### Firmware Tests Failing

```bash
# Clean build
rm -rf build
west build -b nrf54l15pdk_nrf54l15_cpuapp --pristine
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Zephyr Testing](https://docs.zephyrproject.org/latest/develop/test/)
- [k6 Documentation](https://k6.io/docs/)
