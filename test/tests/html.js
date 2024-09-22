const should = require('should');
const fs = require('fs');

const { parse: parseHTML, HTMLElement, TextNode, CommentNode } = require('@test/test-target');

describe('HTML Parser', function () {
	describe('parse()', function () {
		it('should parse "<p id=\\"id\\"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>" and return root element', function () {

			const root = parseHTML('<p id="id"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>');

			const p = new HTMLElement('p', { id: 'id' }, 'id="id"');
			p.appendChild(new HTMLElement('a', { class: 'cls' }, 'class=\'cls\''))
				.appendChild(new TextNode('Hello'));
			const ul = p.appendChild(new HTMLElement('ul', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			p.appendChild(new HTMLElement('span', {}, ''));

			root.firstChild.toString().should.eql(p.toString());
			// root.firstChild.should.eql(p);
		});

		it('should parse "<DIV><a><img/></A><p></P></div>" and return root element', function () {

			const root = parseHTML('<DIV><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});

			const u = undefined;
			const div = new HTMLElement('div', {}, '', root, u, u, { lowerCaseTagName: true });

			const a = div.appendChild(new HTMLElement('a', {}, '', u, u, u, { lowerCaseTagName: true }));
			const img = a.appendChild(new HTMLElement('img', {}, '', u, u, u, { lowerCaseTagName: true }));
			const p = div.appendChild(new HTMLElement('p', {}, '', u, u, u, { lowerCaseTagName: true }));

			root.firstChild.should.eql(div);
		});
		
		it('should parse "<DIV><a><img/></A><p></P></div>" and create same element with root.createElement function', function () {
			const root = parseHTML('<DIV><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});
			const div = root.createElement('div');
			const a = root.createElement("a");
			const img = root.createElement('img');
			const p = root.createElement("p");
			a.appendChild(img);
			div.appendChild(a);
			div.appendChild(p);
			console.log(div.toString());
			root.firstChild.toString().should.eql(div.toString());

		})
		it('should parse "<DIV><a><img/></A><p></P></div>" and create same element with root.createElementNS function', function () {
			const root = parseHTML('<DIV xmlns="http://www.w3.org/1999/xhtml"><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});
			const div = root.createElementNS('http://www.w3.org/1999/xhtml','div');
			const a = root.createElement("a");
			const img = root.createElement('img');
			const p = root.createElement("p");
			a.appendChild(img);
			div.appendChild(a);
			div.appendChild(p);
			console.log(div.toString());
			root.firstChild.toString().should.eql(div.toString());

		})

		it.skip('TODO implement: should use HTMLElement._defaultParseOptions', function () {

			// set _defaultParseOptions,
			// so we dont have to pass parseOptions to every `new HTMLElement(...)`
			// FIXME _defaultParseOptions is not used
			should(HTMLElement._defaultParseOptions.lowerCaseTagName).be.undefined();
			HTMLElement._defaultParseOptions.lowerCaseTagName = true;

			const root = parseHTML('<DIV><a><img/></A><p></P></div>');

			const div = new HTMLElement('div', {}, '', root);

			const a = div.appendChild(new HTMLElement('a', {}, ''));
			const img = a.appendChild(new HTMLElement('img', {}, ''));
			const p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

			// cleanup? remove key from _defaultParseOptions object?
			//HTMLElement._defaultParseOptions.lowerCaseTagName = undefined;
		});

		it('should deal uppercase', function () {
			//should(HTMLElement._defaultParseOptions.comment).be.undefined();

			const html = '<HTML xmlns="http://www.w3.org/1999/xhtml" lang="pt" xml:lang="pt-br"><HEAD><TITLE>SISREG III</TITLE><META http-equiv="Content-Type" content="text/html; charset=UTF-8" /><META http-equiv="Content-Language" content="pt-BR" /><LINK rel="stylesheet" href="/css/estilo.css" type="text/css"><SCRIPT type="text/javascript" src="/javascript/jquery.js" charset="utf-8"></SCRIPT><SCRIPT LANGUAGE=\'JavaScript\'></SCRIPT></HEAD><BODY link=\'#0000AA\' vlink=\'#0000AA\'><CENTER><h1>CONSULTA AO CADASTRO DE PACIENTES SUS</h1></CENTER><DIV id=\'progress_div\'><BR><BR><CENTER><IMG src=\'/imagens/loading.gif\' /></CENTER><CENTER><SPAN style=\'font-size: 80%\'>Processando...</SPAN></CENTER><BR><BR></DIV></BODY></HTML>';

			const root = parseHTML(html, {
				lowerCaseTagName: true
			});

			root.toString().should.eql('<html xmlns="http://www.w3.org/1999/xhtml" lang="pt" xml:lang="pt-br"><head><title>SISREG III</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" ><meta http-equiv="Content-Language" content="pt-BR" ><link rel="stylesheet" href="/css/estilo.css" type="text/css"><script type="text/javascript" src="/javascript/jquery.js" charset="utf-8"></script><script LANGUAGE=\'JavaScript\'></script></head><body link=\'#0000AA\' vlink=\'#0000AA\'><center><h1>CONSULTA AO CADASTRO DE PACIENTES SUS</h1></center><div id=\'progress_div\'><br><br><center><img src=\'/imagens/loading.gif\' ></center><center><span style=\'font-size: 80%\'>Processando...</span></center><br><br></div></body></html>');
			// root.toString().firstChild.should.eql(div);

		});

		it('should parse "<div><a><img/></a><p></p></div>" and return root element', function () {

			const root = parseHTML('<div><a><img/></a><p></p></div>');

			const div = new HTMLElement('div', {}, '', root);
			const a = div.appendChild(new HTMLElement('a', {}, ''));
			const img = a.appendChild(new HTMLElement('img', {}, ''));
			const p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

		});

		it('should parse "<div><a><!-- my comment --></a></div>" and return root element without comments', function () {
			const root = parseHTML('<div><a><!-- my comment --></a></div>');

			const div = new HTMLElement('div', {}, '', root);
			const a = div.appendChild(new HTMLElement('a', {}, ''));

			root.firstChild.should.eql(div);
		});

		it('should parse "<div><a><!-- my comment --></a></div>" and return root element with comments', function () {
			const root = parseHTML('<div><a><!-- my comment --></a></div>', { comment: true });

			const u = undefined;
			const div = new HTMLElement('div', {}, '', root, u, u, { comment: true });
			const a = div.appendChild(new HTMLElement('a', {}, '', u, u, u, { comment: true }));
			const comment = a.appendChild(new CommentNode(' my comment ', u, u, u, u, u, { comment: true }));

			root.firstChild.should.eql(div);
		});

		it('should not parse HTML inside comments', function () {
			const root = parseHTML('<div><!--<a></a>--></div>', { comment: true });

			const u = undefined;
			const div = new HTMLElement('div', {}, '', root, u, u, { comment: true });
			const comment = div.appendChild(new CommentNode('<a></a>', u, u, u, u, u, { comment: true }));

			root.firstChild.should.eql(div);
		});

		// yarn test:target -g 'should parse HTML comments in *'

		it('should parse HTML comments in insertAdjacentHTML', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.insertAdjacentHTML('afterend', '<!-- my comment -->');
			root.toString().should.eql('<div></div><!-- my comment -->');
			div.nextSibling.toString().should.eql('<!-- my comment -->');
		});

		it('should parse HTML comments in set innerHTML', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.innerHTML = '<!-- my comment -->';
			root.toString().should.eql('<div><!-- my comment --></div>');
			div.firstChild.toString().should.eql('<!-- my comment -->');
		});

		it('should parse HTML comments in set_content', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.set_content('<!-- my comment -->');
			root.toString().should.eql('<div><!-- my comment --></div>');
			div.firstChild.toString().should.eql('<!-- my comment -->');
		});

		it('should parse HTML comments in set_content - comment in div', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.set_content('<div><!-- my comment --></div>');
			root.toString().should.eql('<div><div><!-- my comment --></div></div>');
			div.firstChild.toString().should.eql('<div><!-- my comment --></div>');
		});

		it('should parse HTML comments NOT in set_content with option comment=false', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.set_content('<!-- my comment -->', { comment: false });
			root.toString().should.eql('<div></div>');
		});

		it('should parse HTML comments NOT in set_content with option comment=false - comment in div', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.set_content('<div><!-- my comment --></div>', { comment: false });
			root.toString().should.eql('<div><div></div></div>');
		});

		it('should parse HTML comments in replaceWith', function () {
			const root = parseHTML('<div></div>', { comment: true });
			const div = root.querySelector('div');
			div.replaceWith('<!-- my comment -->');
			root.toString().should.eql('<!-- my comment -->');
		});

		it('should parse HTML comments in clone', function () {
			const root = parseHTML('<div><!-- my comment --></div>', { comment: true });
			const div = root.querySelector('div');
			const clone = div.clone();
			clone.toString().should.eql('<div><!-- my comment --></div>');
		});

		it('should parse picture element', function () {

			const root = parseHTML('<picture><source srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"><img src="/images/example.jpg" alt="Example"/></picture>');

			const picture = new HTMLElement('picture', {}, '', root);
			const source = picture.appendChild(new HTMLElement('source', {}, 'srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"'));
			const img = picture.appendChild(new HTMLElement('img', {}, 'src="/images/example.jpg" alt="Example"'));

			root.firstChild.should.eql(picture);

		});

		it('should not extract text in script and style by default', function () {

			const root = parseHTML('<script>1</script><style>2</style>');

			root.firstChild.childNodes.should.be.empty;
			root.lastChild.childNodes.should.be.empty;

		});

		it('should extract text in script and style when ask so', function () {

			const root = parseHTML('<script>1</script><style>2&amp;</style>', {
				script: true,
				style: true
			});

			const script = root.firstChild;
			const style = root.lastChild;
			script.childNodes.should.not.be.empty;
			script.childNodes.should.eql([new TextNode('1', script)]);
			script.text.should.eql('1');
			style.childNodes.should.not.be.empty;
			style.childNodes.should.eql([new TextNode('2&amp;', style)]);
			style.text.should.eql('2&');
			style.rawText.should.eql('2&amp;');
		});

		it('should be able to parse "html/incomplete-script" file', function () {

			const root = parseHTML(fs.readFileSync(__dirname + '/../assets/html/incomplete-script').toString(), {
				script: true
			});

		});

		it('should be able to parse namespaces', function () {
			const namespacedXML = '<ns:identifier>content</ns:identifier>';
			parseHTML(namespacedXML).toString().should.eql(namespacedXML);
		});

		it('should parse "<div><a><img/></a><p></p></div>.." very fast', function () {

			for (let i = 0; i < 100; i++)
				parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');

		});

		it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function () {

			for (let i = 0; i < 100; i++)
				parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
					lowerCaseTagName: true
				});

		});

		// Test for broken tags. <h3>something<h3>

		it('should parse "<div><h3>content<h3> <span> other <span></div>" (fix h3, span closing tag) very fast', function () {
			const root = parseHTML(fs.readFileSync(__dirname + '/../assets/html/incomplete-script').toString());
		});

		it('should parse table currect', function () {
			this.timeout(4000); // pass test on slow CPUs
			const root = parseHTML(fs.readFileSync(__dirname + '/../assets/html/tables.html').toString(), {
				script: true
			});
			const tables = root.querySelectorAll('table');
			tables.length.should.eql(3176);
		});
	});

	describe('TextNode', function () {
		it('#isWhitespace', function () {
			let node = new TextNode('');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t&nbsp; \t');
			node.isWhitespace.should.be.ok;
		});
		it('parse text node', function () {
			const result = parseHTML('hello mmstudio');
			result.firstChild.should.instanceOf(TextNode);
			result.toString().should.eql('hello mmstudio');
		});
	});

	describe('HTMLElement', function () {
		describe('#removeWhitespace()', function () {
			it('should remove whitespaces while preserving nodes with content', function () {
				const root = parseHTML('<p> \r \n  \t <h5>  123&nbsp;  </h5></p>');

				const textNode = new TextNode('  123&nbsp;  ');
				textNode.rawText = textNode.trimmedRawText;
				textNode.rawText.should.eql(' 123&nbsp; ');

				const p = new HTMLElement('p', {}, '', root);
				p
					.appendChild(new HTMLElement('h5', {}, ''))
					.appendChild(textNode);

				root.firstChild.removeWhitespace().should.eql(p);
			});

			it('should preserve legitimate leading/trailing whitespace in TextNode', function () {
				parseHTML('<p>Hello  <em>World</em>!</p>').removeWhitespace().firstChild.text.should.eql('Hello World!');
				parseHTML('<p>\t\nHello\n\t<em>World</em>!</p>').removeWhitespace().firstChild.text.should.eql('HelloWorld!');
				parseHTML('<p>\t\n  Hello \n\t<em>World</em>!</p>').removeWhitespace().firstChild.text.should.eql(' Hello World!');
			});
		});

		describe('#rawAttributes', function () {
			it('should return escaped attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' @click="doSmt()"></p>');
				root.firstChild.rawAttributes.should.eql({
					'a': '12',
					'data-id': '!$$&amp;',
					'yAz': '1',
					'@click': 'doSmt()'
				});
			});
		});

		describe('#attributes', function () {
			it('should return attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' class="" disabled></p>');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'data-id': '!$$&',
					'yAz': '1',
					'disabled': '',
					'class': ''
				});
			});
		});

		describe('#getAttribute', function () {
			it('should return value of the attribute', function () {
				const root = parseHTML('<p a="a1b"></p>');
				root.firstChild.getAttribute('a').should.eql('a1b');
			});

			it('should return value of the first attribute', function () {
				const root = parseHTML('<p a="a1b" a="fail"></p>');
				root.firstChild.getAttribute('a').should.eql('a1b');
			});

			it('should return null when there is no such attribute', function () {
				const root = parseHTML('<p></p>');
				should.equal(root.firstChild.getAttribute('b'), null);
			});

			it('should return empty string as broser behavior', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.getAttribute('required').should.eql('');
			});

			it('should return null as browser behavior', function () {
				const root = parseHTML('<input required foo="" bar=\'\'>');
				const input = root.firstChild;
				input.getAttribute('required').should.eql('');
				input.setAttribute('readonly', null);
				input.getAttribute('readonly').should.eql('null');
				input.setAttribute('disabled', '');
				input.getAttribute('disabled').should.eql('');
				input.toString().should.eql('<input required foo bar readonly="null" disabled>')
			});
		});

		describe('#setAttribute', function () {
			it('should edit the attributes of the element', function () {
				const root = parseHTML('<p a=12></p>');
				const attr1 = root.firstChild.attributes;
				attr1.should.eql({
					'a': '12',
				});
				root.firstChild.setAttribute('a', 13);
				const attr2 = root.firstChild.attributes;
				attr2.should.eql({
					'a': '13',
				});
				root.firstChild.getAttribute('a').should.eql('13');
				root.firstChild.toString().should.eql('<p a="13"></p>');
			});
			it('should add an attribute to the element', function () {
				const root = parseHTML('<p a=12></p>');
				root.firstChild.setAttribute('b', 13);
				root.firstChild.attributes.should.eql({
					'a': '12',
					'b': '13',
				});
				root.firstChild.toString().should.eql('<p a="12" b="13"></p>');
				root.firstChild.setAttribute('required', '');
				root.firstChild.toString().should.eql('<p a="12" b="13" required></p>');
			});
			it('should convert value to string', function () {
				const root = parseHTML('<p a=12 b=13 c=14></p>');
				const p = root.firstChild;
				p.setAttribute('b', null);
				p.setAttribute('c', undefined);
				p.getAttribute('b').should.eql('null');
				p.getAttribute('c').should.eql('undefined');
				p.toString().should.eql('<p a="12" b="null" c="undefined"></p>');
			});
			it('should throw type Error', function () {
				const root = parseHTML('<p a=12 b=13 c=14></p>');
				const p = root.firstChild;
				should.throws(function () { p.setAttribute('b') });
				should.throws(function () { p.setAttribute() });
			});
			it('should keep quotes arount value', function () {
				const root = parseHTML('<p a="12"></p>');
				root.firstChild.setAttribute('b', 13);
				root.firstChild.setAttribute('c', '2');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'b': '13',
					'c': '2'
				});
				root.firstChild.toString().should.eql('<p a="12" b="13" c="2"></p>');
			});
		});

		describe('#setAttributes', function () {
			it('should return attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' class="" disabled></p>');
				root.firstChild.setAttributes({
					c: 12,
					d: '&&<>foo'
				});
				root.firstChild.attributes.should.eql({
					'c': '12',
					d: '&&<>foo'
				});
				root.firstChild.toString().should.eql('<p c="12" d="&&<>foo"></p>');
				// root.firstChild.toString().should.eql('<p c=12 d="&#x26;&#x26;&#x3C;&#x3E;foo"></p>');
			});
		});

		describe('#removeAttribute', function () {
			it('should remove attribute required', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.removeAttribute('required');
				input.toString().should.eql('<input>');
			});
		});

		describe('#hasAttribute', function () {
			it('should return true or false when has or has not some attribute', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.hasAttribute('required').should.eql(true);
				input.removeAttribute('required');
				input.hasAttribute('required').should.eql(false);
			});
		});

		describe('#structuredText', function () {
			it('should return correct structured text', function () {
				const root = parseHTML('<span>o<p>a</p><p>b</p>c</span>');
				root.structuredText.should.eql('o\na\nb\nc');
			});

			it('should not return comments in structured text', function () {
				const root = parseHTML('<span>o<p>a</p><!-- my comment --></span>', { comment: true });
				root.structuredText.should.eql('o\na');
			});

			it('should return correct structured text (block level elements)', function () {
				const root = parseHTML('<p>content</p><span><u><h1>inside</h1><i>htm<u>l</u></i></u></span>');
				root.structuredText.should.eql('content\ninside\nhtml');
			});
		});
		describe('#set_content', function () {
			it('set content string', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].set_content('<span><div>abc</div>bla</span>');
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content nodes', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content node', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes[0]);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content text', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].set_content('abc');
				root.toString().should.eql('<div>abc</div>');
			});
			it('set content pre', function () {
				const root = parseHTML(`<html><head></head><body></body></html>`);
				const body = root.querySelector("body");
				body.set_content(`<pre>this    is some    preformatted    text</pre>`);
				root.toString().should.eql('<html><head></head><body><pre>this    is some    preformatted    text</pre></body></html>')
			});
		});

		describe('encode/decode', function () {
			it('should decode attributes value', function () {
				const root = parseHTML('<img src="default.jpg" alt="Verissimo, Ilaria D&#39;Amico: &laquo;Sogno una bambina. Buffon mi ha chiesto in moglie tante volte&raquo;">');
				root.firstChild.getAttribute('alt').should.eql(`Verissimo, Ilaria D'Amico: «Sogno una bambina. Buffon mi ha chiesto in moglie tante volte»`);
				root.firstChild.attributes.alt.should.eql(`Verissimo, Ilaria D'Amico: «Sogno una bambina. Buffon mi ha chiesto in moglie tante volte»`);
				root.firstChild.setAttribute('alt', '&laquo;Sogno');
				root.firstChild.getAttribute('alt').should.eql('«Sogno');
				root.firstChild.rawAttributes.alt.should.eql('&laquo;Sogno');
			});

			it('should not decode text from parseHTML()', function () {
				// https://github.com/taoqf/node-html-parser/issues/33
				const content = `&lt;p&gt; Not a p tag &lt;br /&gt; at all`;
				const root = parseHTML(`<div>${content}</div>`);
				root.childNodes.should.have.length(1);

				const divNode = root.firstChild;
				divNode.childNodes.should.have.length(1);

				const textNode = divNode.firstChild;
				textNode.rawText.should.eql(content);
			});

			it(`should decode for node text property`, function () {
				const encodedText = `My&gt;text`;
				const decodedText = `My>text`;
				const root = parseHTML(`<p>${encodedText}</p>`);

				const pNode = root.firstChild;
				pNode.text.should.eql(decodedText);
				pNode.rawText.should.eql(encodedText);

				const textNode = pNode.firstChild;
				textNode.text.should.eql(decodedText);
				textNode.rawText.should.eql(encodedText);
			});
		});

		describe('#insertAdjacentHTML() should parse and insert childrens', function () {
			it('shoud insert children after current node', function () {
				const html = '<a><b></b><e></e></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				b.insertAdjacentHTML('afterend', '<c><d></d></c>');
				a.toString().should.eql('<a><b></b><c><d></d></c><e></e></a>');
			});

			it('shoud insert children before current node', function () {
				const html = '<a><e></e><b></b></a>';
				const root = parseHTML(html);
				const b = root.querySelector('b');
				b.insertAdjacentHTML('beforebegin', '<c></c>');
				root.toString().should.eql('<a><e></e><c></c><b></b></a>');
			});

			it('shoud append children in current node', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('beforeend', '<b></b>');
				a.toString().should.eql('<a><b></b></a>');
				a.insertAdjacentHTML('beforeend', '<c></c>');
				a.toString().should.eql('<a><b></b><c></c></a>');
			});

			it('shoud insert children at position 0', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('afterbegin', '<b></b>');
				a.toString().should.eql('<a><b></b></a>');
				a.insertAdjacentHTML('afterbegin', '<c></c>');
				a.toString().should.eql('<a><c></c><b></b></a>');
			});

			it('shoud insert text child at position 0', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('afterbegin', 'abc');
				a.toString().should.eql('<a>abc</a>');
			});
		});

		describe('#removeChild', function () {
			it('shoud remove child node', function () {
				const html = '<a><b></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				a.childNodes.length.should.eql(1);
				a.removeChild(b);
				a.childNodes.length.should.eql(0);
			});
			it('shoud not remove child node which does not exist', function () {
				const html = '<a><b><c></c></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				const c = b.firstChild;
				a.childNodes.length.should.eql(1);
				a.removeChild(c);
				a.childNodes.length.should.eql(1);
			});
		});

		describe('#getElementsByTagName', function () {
			it('find the divs in proper order', function () {
				const root = parseHTML(`
					<section>
						<div data-test="1.0">
							<div data-test="1.1">
								<div data-test="1.1.1"></div>
							</div>
						</div>
						<div data-test="2.0"></div>
					</section>
				`);
				const divs = root.getElementsByTagName('div');

				for (const div of divs) {
					div.tagName.should.eql('DIV');
				}

				// the literal appearance order
				divs[0].attributes['data-test'].should.eql('1.0');
				divs[1].attributes['data-test'].should.eql('1.1');
				divs[2].attributes['data-test'].should.eql('1.1.1');
				divs[3].attributes['data-test'].should.eql('2.0');
			});

			// check that really only children are found, no parents or anything
			it('only return relevant items', function () {
				const root = parseHTML(`
					<section>
						<div data-ignore="true"></div>
	
						<div id="suit" data-ignore="true">
							<div data-ignore="false"></div>
							<div data-ignore="false"></div>
						</div>
	
						<div data-ignore="true"></div>
					</section>
				`);
				const divs = root.querySelector('#suit').getElementsByTagName('div');

				divs.length.should.eql(2);

				for (const div of divs) {
					div.attributes['data-ignore'].should.eql('false');
				}
			});

			it('return all elements if tagName is *', function () {
				const root = parseHTML(`
					<section>
						<div></div>
						<span></span>
						<p></p>
					</section>
				`);
				const items = root.getElementsByTagName('*');

				items.length.should.eql(4);
				items[0].tagName.should.eql('SECTION');
				items[1].tagName.should.eql('DIV');
				items[2].tagName.should.eql('SPAN');
				items[3].tagName.should.eql('P');
			});

			it('return an empty array if nothing is found', function () {
				const root = parseHTML('<section></section>');

				root.getElementsByTagName('div').length.should.eql(0);
			});

			it('allow sparse arrays', function () {
				const root = parseHTML(`
					<section>
						<div></div>
						<div></div>
						<div></div>
					</section>
				`);
				delete root.querySelector('section').childNodes[1];

				root.getElementsByTagName('div').length.should.eql(2);
			});
		});
	});

	describe('stringify', function () {
		it('#toString()', function () {
			const html = '<p id="id" data-feidao-actions="ssss"><a class=\'cls\'>Hello</a><ul><li>aaaaa</li></ul><span>bbb</span></p>';
			const root = parseHTML(html);
			root.toString().should.eql(html)
		});

		it('#toString() should not return comments by default', function () {
			const html = '<p><!-- my comment --></p>';
			const result = '<p></p>';
			const root = parseHTML(html);
			root.toString().should.eql(result);
		});

		it('#toString() should return comments when specified', function () {
			const html = '<!----><p><!-- my comment --></p>';
			const root = parseHTML(html, { comment: true });
			root.toString().should.eql(html);
		});

		it('#toString() should contains id and classnames', function () {
			const el = new HTMLElement('div', { 'id': 'new_container', 'class': 'container' });
			el.id.should.eql('new_container');
			el.classNames.should.eql('container');
			el.toString().should.eql('<div id="new_container" class="container"></div>');
		});

		it('#toString() should contains classnames withspaces', function () {
			const el = new HTMLElement('div', { 'class': 'container1  container2' });
			el.classNames.should.eql('container1 container2');
			el.toString().should.eql('<div class="container1 container2"></div>');
		});
	});

	describe('Comment Element', function () {
		it('comment nodeType should be 8', function () {
			const root = parseHTML('<!-- my comment -->', { comment: true });
			root.firstChild.nodeType.should.eql(8);
		});
	});

	describe('Custom Element', function () {
		it('parse "<my-widget></my-widget>" tagName should be "my-widget"', function () {

			const root = parseHTML('<my-widget></my-widget>');

			root.firstChild.tagName.should.eql('MY-WIDGET');
		});
	});

	describe('Custom Element multiple dash', function () {
		it('parse "<my-new-widget></my-new-widget>" tagName should be "my-new-widget"', function () {

			const root = parseHTML('<my-new-widget></my-new-widget>');

			root.firstChild.tagName.should.eql('MY-NEW-WIDGET');
		});
	});
});
