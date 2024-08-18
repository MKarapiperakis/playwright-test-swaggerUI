import { test, expect } from '@playwright/test';
import { BearerAuthentication } from './page-objects/bearer-authentication';
import { GETRequest } from './page-objects/get-request';
import { POSTRequest } from './page-objects/post-request';
import { PUTRequest } from './page-objects/put-request';
import { DELETERequest } from './page-objects/delete-request';
import { compareResultWithSwagger } from './helper/compareResponseBody';
import {IDs} from './data/test-data'
import { BasicAuthentication } from './page-objects/basic-authentication';
require("dotenv").config();

let bearerResponseStatus: string | ""
let bearerUserId: string | "";
let basicToken: string | "";

test.beforeEach(async ({page}) => {
  if(process.env.environment == 'production')
    await page.goto(`https://${process.env.BASIC_USERNAME}:${process.env.BASIC_PASSWORD}@${process.env.HOST_URI}`);
  else
    await page.goto(`http://${process.env.BASIC_USERNAME}:${process.env.BASIC_PASSWORD}@localhost:8082/data/api/doc/`);
  await page.locator('.servers select').click();
  await page.selectOption('.servers select', { value: process.env.HOST_URL });
  await page.locator('.servers select').click();

  const bearerAuthentication = new BearerAuthentication(page)
  await bearerAuthentication.login("admin")
  bearerResponseStatus = await bearerAuthentication.getResponseStatus()
  bearerUserId = await bearerAuthentication.getUserId()
  if(bearerResponseStatus == '200')
    await bearerAuthentication.setBearerToken()
  else
  {
    let responseBody = await bearerAuthentication.getResponseBody()
    console.log(`request failed with status code: ${bearerResponseStatus} and body: ${responseBody}`)
  }

  const basicAuthentication = new BasicAuthentication(page)
  await basicAuthentication.setBasicToken()
  basicToken = await basicAuthentication.getToken()
})


test.describe('Swagger UI GET requests', () => {

  test('has title', async ({ page }) => {
     await expect(page).toHaveTitle(/Swagger UI/);
  });

  test('get list of users', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')

     const getUsers = new GETRequest(page,[],"Get a list of users")
     await getUsers.execute()

     let responseBody = await getUsers.getResponseBody()
     let responseStatus = await getUsers.getResponseStatus()
     expect(responseStatus).toBe('200')
     expect(compareResultWithSwagger(responseBody,"/data/api/users","users[0]","get")).toBe(true)
  });

  test('get user by ID', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')
    
     let parameters = [bearerUserId.toString()]

     const getUser = new GETRequest(page,parameters,"Get user by ID")
     await getUser.execute()

     let responseBody = await getUser.getResponseBody()
     let responseStatus = await getUser.getResponseStatus()
     expect(responseStatus).toBe('200')
     expect(compareResultWithSwagger(responseBody,"/data/api/user/{id}","user[0]","get")).toBe(true)
  });

  test('get list of booking requests', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')

     const getBookingRequests = new GETRequest(page,[],"Get a list of booking requests")
     await getBookingRequests.execute()

     let responseBody = await getBookingRequests.getResponseBody()
     let responseStatus = await getBookingRequests.getResponseStatus()
     expect(responseStatus).toBe('200')
     expect(compareResultWithSwagger(responseBody,"/data/api/booking","","get")).toBe(true)
  });

  test('get availability', async ({ page }) => {
     const getAvailability = new GETRequest(page,[],"Get availability")
     await getAvailability.execute()

     let responseBody = await getAvailability.getResponseBody()
     let responseStatus = await getAvailability.getResponseStatus()
     expect(responseStatus).toBe('200')
     expect(compareResultWithSwagger(responseBody,"/data/api/availability","disabledDates[0]","get")).toBe(true)
  });

  test('get list of markers', async ({ page }) => {
    const getMarkers = new GETRequest(page,[],"Get a list of markers")
    await getMarkers.execute()

    let responseBody = await getMarkers.getResponseBody()
    let responseStatus = await getMarkers.getResponseStatus()
    expect(responseStatus).toBe('200')
    expect(compareResultWithSwagger(responseBody,"/data/api/markers","markers[0]","get")).toBe(true)
 });

})

test.describe('Swagger UI POST requests', () => {

  test('Create a new user', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')

     const createUser = new POSTRequest(page,"Create a new user")
     await createUser.execute("/data/api/users")
     
     let responseStatus = await createUser.getResponseStatus()
     expect(responseStatus).toBe('201')
  });

  test('Booking request', async ({ page }) => {
     //basic token is required for this request
     expect(basicToken).toBeTruthy()

     const createBookingRequest = new POSTRequest(page,"User booking")
     await createBookingRequest.execute("/data/api/booking")
     
     let responseStatus = await createBookingRequest.getResponseStatus()
     expect(responseStatus).toBe('200')
  });

  test('Add availability', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')

     const addAvailability = new POSTRequest(page,"Add availability")
     await addAvailability.execute("/data/api/availability")
     
     let responseStatus = await addAvailability.getResponseStatus()
     expect(responseStatus).toBe('200')
  });

  test('Add marker', async ({ page }) => {
    //bearer token is required for this request
    expect(bearerResponseStatus).toBe('200')

    const addMarker = new POSTRequest(page,"Create a new marker")
    await addMarker.execute("/data/api/markers")
    
    let responseStatus = await addMarker.getResponseStatus()
    expect(responseStatus).toBe('201')
 });

  test('dialogFlow', async ({ page }) => {
     //basic token is required for this request
     expect(basicToken).toBeTruthy()

     const dialogFlowRequest = new POSTRequest(page,"Interact with DialogFlow")
     await dialogFlowRequest.execute("/data/api/dialogFlow")
     
     let responseStatus = await dialogFlowRequest.getResponseStatus()
     let responseBody = await dialogFlowRequest.getResponseBody()
     expect(responseStatus).toBe('200')
     expect(responseBody).toBeTruthy()
     console.log(`dialogFlow response: ${JSON.stringify(responseBody)}`)
  });

  test('report a problem', async ({ page }) => {
    //bearer token is required for this request
    expect(bearerResponseStatus).toBe('200')

    const reportProblem = new POSTRequest(page,"Report a problem")
    await reportProblem .execute("/data/api/problem")
    
    let responseStatus = await reportProblem.getResponseStatus()
    expect(responseStatus).toBe('200')
 });
})

test.describe('Swagger UI PUT requests', () => {

  test('Update user', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')

     let parameters = [IDs().userID.toString()]
     const updateUser = new PUTRequest(page,parameters,"Update user by ID")
     await updateUser.execute("/data/api/user/{id}")
     
     let responseStatus = await updateUser.getResponseStatus()
     expect(responseStatus).toBe('200')
  });
})

test.describe('Swagger UI DELETE requests', () => {

  test('Delete booking request', async ({ page }) => {
     //bearer token is required for this request
     expect(bearerResponseStatus).toBe('200')
     
     let parameters = [IDs().bookingID.toString()]
     const deleteBookingRequest = new DELETERequest(page,parameters,"Delete booking by ID")
     await deleteBookingRequest.execute()
     
     let responseStatus = await deleteBookingRequest.getResponseStatus()
     expect(responseStatus).toBe('200')
  });

  test('Delete marker ', async ({ page }) => {
    //bearer token is required for this request
    expect(bearerResponseStatus).toBe('200')
    
    let parameters = [IDs().markerID.toString()]
    const deleteMarker = new DELETERequest(page,parameters,"Delete marker by ID")
    await deleteMarker.execute()
    
    let responseStatus = await deleteMarker.getResponseStatus()
    expect(responseStatus).toBe('200')
 });
})