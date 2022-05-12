const Page = require('./helpers/page');

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto('http://localhost:3000');
});

afterEach(async () => {
	 await page.close()
});

describe('When logged in', async () => {

	beforeEach(async () => {
		await page.login();
		await page.click('a[href="/blogs/new"]');
	});

	test('can see create blog form', async () => {
		const text = await page.getContentsOf('form div.title label');
		expect(text).toEqual('Blog Title');
	});

	describe('And using invalid inputs', async () => {

		beforeEach(async () => {
			await page.click('form button');
		});

		test('the form shows an error message', async () => {
			const errorTitle = await page.getContentsOf('.title .red-text');
			const errorContent = await page.getContentsOf('.content .red-text');
			expect(errorTitle).toEqual('You must provide a value');
			expect(errorContent).toEqual('You must provide a value');
		});
	});

	describe('And using valid inputs', async () => {

		beforeEach(async () => {
			await page.type('.title input', 'My title');
			await page.type('.content input', 'My content');
			await page.click('form button');
		});

		test('Submitting takes user to review screen', async () => {
			const text = await page.getContentsOf('form h5');
			expect(text).toEqual('Please confirm your entries');
		});

		test('Submitting then saving takes adds blog to blogs page', async () => {
			await page.click('button.green');
			await page.waitFor('.card-content');
			const title = await page.getContentsOf('.card-content .card-title');
			const content  = await page.getContentsOf('.card-content p');
			expect(title).toEqual('My title');
			expect(content).toEqual('My content');
		});
	});
});

describe('When user is not logged in', async () => {

	test('User can not create blog posts', async () => {
		const result = await page.post('/api/blogs', { title: 'My title', content: 'My content' });
		expect(result).toEqual({ error: 'You must log in!' });
	});

	test('User can not get a list of blog posts', async () => {
		const result = await page.get('/api/blogs');
		expect(result).toEqual({ error: 'You must log in!' });
	});
});