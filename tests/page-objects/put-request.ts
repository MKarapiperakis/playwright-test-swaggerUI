import { Locator, Page, expect } from '@playwright/test';
import { saveError } from '../helper/screenshotError';
import { getRequestBodyObject } from '../helper/getRequestBody';

export class PUTRequest{
    
    private requestBody: Locator
    private readonly page: Page
    private responseBody: string
    private responseStatus: string
    private identifier: string
    private parameters: Array<string>

   /**
     * PUT Request Constructor
     * @param page - Current page
     * @param parameters - Array containing the URL parameters
     * @param identifier - Unique description next of each request
     */
    constructor(page: Page,parameters: Array<string>, identifier: string)
    {
        this.page = page;
        this.parameters = parameters;
        this.identifier = identifier;
    }

    async execute(path)
    {
        await this.page.locator('.opblock-summary').getByText(this.identifier,{exact: true}).click()
        await this.page.locator('.try-out').getByRole('button').click()

        if(this.parameters.length > 0)
            {
                const parametersTable = this.page.locator('.parameters')
                await parametersTable.scrollIntoViewIfNeeded()
                for(let i=0; i<this.parameters.length; i++)
                {
                    const inputField = this.page.locator('.parameters tbody tr').nth(i).locator('input');
                    await inputField.fill(''); 
                    await inputField.pressSequentially(this.parameters[i])
                }
            }

        let requestBody = this.page.locator('.body-param__text')
        await requestBody.clear()
        await requestBody.fill(getRequestBodyObject(path,"put"))
        
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