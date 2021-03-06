import CustomerAggregate from './CustomerAggregate'
import { CUSTOMER_CREATED } from '../constants/events'
import { CustomerCreated } from '../events/CustomerEvents'

const customer = CustomerAggregate()

const CUSTOMER_1_ID = '1234-5678-9012-3456'
const CUSTOMER_1_NAME = 'Test Customer'
const CUSTOMER_1_EMAIL = 'test@mail.com'
const CUSTOMER_1_PASSWORD = 'test1234'

const CUSTOMER_1_NAME_UPDATED = 'Test Customer Updated'

it('should return state with version 0', () => {
  //  we want no event history to test this case
  const storedEvents = new Set()
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  expect(version).toBe(0)
})

it('should register a customer', () => {
  //  we want no event history to test this case
  const storedEvents = new Set()
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(0)
  expect(uncommittedChanges.size).toBe(0)
  //  register a customer
  state = customer.register(state, CUSTOMER_1_ID, CUSTOMER_1_NAME, CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD)
  version = customer.getCurrentVersion(state)
  expect(state.created).toBe(0)
  expect(state.active).toBe(0)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe(CUSTOMER_1_NAME)
  expect(state.email).toBe(CUSTOMER_1_EMAIL)
  expect(state.password).toBe(CUSTOMER_1_PASSWORD)
  //  new changes are yet to be written to Event Store
  //  therefore aggreagate version must not change
  //  and applied change must be added to uncommittedChanges set
  expect(version).toBe(0)
  expect(uncommittedChanges.size).toBe(1)
})

it('should create a new customer', () => {
  //  we want no event history to test this case
  const storedEvents = new Set()
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(0)
  expect(uncommittedChanges.size).toBe(0)
  //  create new customer
  state = customer.create(state, CUSTOMER_1_ID, CUSTOMER_1_NAME, CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD)
  version = customer.getCurrentVersion(state)
  expect(state.created).toBe(1)
  expect(state.active).toBe(1)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe(CUSTOMER_1_NAME)
  expect(state.email).toBe(CUSTOMER_1_EMAIL)
  expect(state.password).toBe(CUSTOMER_1_PASSWORD)
  //  new changes are yet to be written to Event Store
  //  therefore aggreagate version must not change
  //  and applied change must be added to uncommittedChanges set
  expect(version).toBe(0)
  expect(uncommittedChanges.size).toBe(1)
})

it('should throw an error on create for an existing customer aggregate', () => {
  //  create event history (that would be loaded from event store in real application)
  const storedEvents = new Set()
  storedEvents.add(CustomerCreated(CUSTOMER_1_ID, CUSTOMER_1_NAME, CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD))
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(1)
  expect(uncommittedChanges.size).toBe(0)
  //  create new customer method on existing customer should throw an error
  expect(() => {
    customer.create(state, CUSTOMER_1_ID, CUSTOMER_1_NAME, CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD)
  }).toThrow('can not create same customer more than once')
})

it('should update an existing customer aggregate', () => {
  //  create event history (that would be loaded from event store in real application)
  const storedEvents = new Set()
  storedEvents.add(CustomerCreated(CUSTOMER_1_ID, CUSTOMER_1_NAME, CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD))
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(1)
  expect(uncommittedChanges.size).toBe(0)
  customer.update(state, CUSTOMER_1_NAME_UPDATED)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe(CUSTOMER_1_NAME_UPDATED)
})

it('should throw an error on updating a non-existing customer aggregate', () => {
  //  create event history (that would be loaded from event store in real application)
  const storedEvents = new Set()
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(0)
  expect(uncommittedChanges.size).toBe(0)
  //  create new customer method on existing customer should throw an error
  expect(() => {
    customer.update(state, 'Test Customer Updated')
  }).toThrow("can not update customer that doesn't exist")
})

it('should deactivate an existing customer aggregate', () => {
  //  create event history (that would be loaded from event store in real application)
  const storedEvents = new Set()
  storedEvents.add(CustomerCreated(CUSTOMER_1_ID, 'Test Customer', CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD))
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(1)
  expect(uncommittedChanges.size).toBe(0)
  customer.deactivate(state)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe('Test Customer')
  expect(state.deactivated).toBeTruthy()
})

it('should reactivate an existing customer aggregate', () => {
  //  create event history (that would be loaded from event store in real application)
  const storedEvents = new Set()
  storedEvents.add(CustomerCreated(CUSTOMER_1_ID, 'Test Customer', CUSTOMER_1_EMAIL, CUSTOMER_1_PASSWORD))
  //  prepare aggregate with no event history (new aggregate)
  let state = customer.loadFromHistory(storedEvents)
  let version = customer.getCurrentVersion(state)
  let uncommittedChanges = customer.getUncommittedChanges(state)
  expect(version).toBe(1)
  expect(uncommittedChanges.size).toBe(0)
  customer.deactivate(state)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe('Test Customer')
  expect(state.deactivated).toBeTruthy()
  customer.reactivate(state)
  expect(state.customerId).toBe(CUSTOMER_1_ID)
  expect(state.name).toBe('Test Customer')
  expect(state.deactivated).toBeUndefined()
})