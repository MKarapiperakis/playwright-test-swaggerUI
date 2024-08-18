import { Locator, Page, expect } from '@playwright/test';
import { saveError } from '../helper/screenshotError';
import { getRequestBodyObject } from '../helper/getRequestBody';

export class POSTRequest{
    
    private requestBody: Locator
    private readonly page: Page
    private responseBody: string
    private responseStatus: string
    private identifier: string

    /**
     * POST Request Constructor
     * @param page - Current page
     * @param identifier - Unique description next of each request
     */
    constructor(page: Page, identifier: string)
    {
        this.page = page;
        this.identifier = identifier;
    }

    async execute(path)
    {
        await this.page.locator('.opblock-summary').getByText(this.identifier,{exact: true}).click()
        await this.page.locator('.try-out').getByRole('button').click()

        let requestBody = this.page.locator('.body-param__text')
        await requestBody.clear()
        await requestBody.fill(getRequestBodyObject(path,"post"))
        
        await this.page.getByRole('button',{name: 'Execute'}).click()

        const responseTable = this.page.locator('.responses-table.live-responses-table')
        await responseTable.scrollIntoViewIfNeeded()
        const statusCode = await this.page.locator('.responses-table.live-responses-table .response .response-col_status').textContent();
        await saveError(statusCode,this.page,this.identifier)
        this.responseStatus = statusCode || ''
        this.responseBody = await this.page.locator('.responses-table.live-responses-table .response .language-json ').textContent() || ''
        await this.page.locator('.opblock-summary').getByText(this.identifier,{exact: true}).click()
    }

    async getResponseStatus()
    {
        return this.responseStatus
    }

    async getResponseBody()
    {
        return JSON.parse(this.responseBody)
    }
}

