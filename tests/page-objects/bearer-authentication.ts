import { Locator, Page, expect } from '@playwright/test';
import {adminCredentials,visitorCredentials} from '../data/test-data'
import { saveError } from '../helper/screenshotError';


export class BearerAuthentication{

    private readonly page: Page
    private requestBody: Locator
    private responseBody: string
    private token: string
    private userId: string
    private responseStatus: string

    constructor(page: Page)
    {
        this.page = page;
    }

    async login(role: string){
        
    await this.page.locator('.opblock-summary').getByText("User login",{exact: true}).click()
    await this.page.locator('.try-out').getByRole('button').click()
    this.requestBody = this.page.locator('.body-param__text')
    await this.requestBody.clear()
    if(role == 'admin')
        await this.requestBody.pressSequentially(JSON.stringify(adminCredentials()))
    else
        await this.requestBody.pressSequentially(JSON.stringify(visitorCredentials()))
    await this.page.getByRole('button',{name: 'Execute'}).click()


    const responseTable = this.page.locator('.responses-table.live-responses-table')
    await responseTable.scrollIntoViewIfNeeded()


    const statusCode = await this.page.locator('.responses-table.live-responses-table .response .response-col_status').textContent();
    await saveError(statusCode,this.page,"bearer-error")
    this.responseBody = await this.page.locator('.responses-table.live-responses-table .response .language-json ').textContent() || ''
    this.token = JSON.parse(this.responseBody).token
    this.userId = JSON.parse(this.responseBody).userId
    this.responseStatus = statusCode || ''
    await this.page.locator('.opblock-summary').getByText("User login",{exact: true}).click()
    }

    async getToken()
    {
        return this.token
    }

    async getUserId()
    {
        return this.userId
    }

    async getResponseStatus()
    {
        return this.responseStatus
    }

    async getResponseBody()
    {
        return this.responseBody
    }

    async setBearerToken(){
        await this.page.getByRole('button',{name: 'Authorize'}).click()
        await this.page.locator('.auth-container').locator('[aria-label="auth-bearer-value"]').fill(this.token)
        await this.page.locator('.auth-container').filter({hasText: 'BearerAuth'}).getByRole('button',{name: 'Authorize'}).click()
        await this.page.locator('.close-modal').click()
    }

}

