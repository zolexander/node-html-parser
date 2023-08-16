const { parse } = require('@test/test-target');

describe.only('issue 242', function () {
	it(`a.rawAttrs returns 'href="/" rel="home"' but a.getAttribute("href') returns undefined`, function () {
		const html = `<div><a href="/" rel="home">Git Hub</a></div>`;
		const root = parse(html);
		const links = root.querySelectorAll("a");

		const [a] = links;
		a.rawAttrs.should.eql('href="/" rel="home"');
		a.getAttribute('href').should.eql('/');
	});
});
