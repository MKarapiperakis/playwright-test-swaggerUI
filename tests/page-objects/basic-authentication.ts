import { Page } from '@playwright/test';
require("dotenv").config();

export class BasicAuthentication{

    private readonly page: Page
    private token: string

    constructor(page: Page)
    {
        this.page = page;
    }

    async getToken()
    {
        return this.token
    }


    async setBasicToken(){
        await this.page.getByRole('button',{name: 'Authorize'}).click()
        const username = process.env.BASIC_AUTH_USERNAME || ''
        const password = process.env.BASIC_AUTH_PASSWORD || ''
        this.token = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        await this.page.locator('.auth-container').filter({hasText: 'BasicAuth'}).locator('[aria-label="auth-basic-username"]').pressSequentially(username)
        await this.page.locator('.auth-container').filter({hasText: 'BasicAuth'}).getByLabel("Password").pressSequentially(password)
        await this.page.locator('.auth-container').filter({hasText: 'BasicAuth'}).getByRole('button',{name: 'Authorize'}).click()
        await this.page.locator('.close-modal').click()
    }

}

