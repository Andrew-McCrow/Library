// Library data store
const myLibrary = [];

// UUID helper with fallback (works in modern browsers and Node; falls back to a v4-style generator)
function getUUID() {
	try {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		// Node.js newer versions expose crypto.randomUUID on global crypto as well
		if (typeof require === 'function') {
			try {
				// eslint-disable-next-line global-require
				const nodeCrypto = require('crypto');
				if (typeof nodeCrypto.randomUUID === 'function') return nodeCrypto.randomUUID();
			} catch (e) {
				// ignore
			}
		}
	} catch (e) {
		// ignore and fallback
	}

	// Fallback to simple RFC4122 v4 style UUID generator
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// Book constructor
function Book(title, author, pages, read = false) {
	this.id = getUUID();
	this.title = title || '';
	this.author = author || '';
	this.pages = pages || 0;
	this.read = Boolean(read);
}

// Add a book to the library (separate function, not inside the constructor)
function addBookToLibrary(title, author, pages, read = false) {
	const book = new Book(title, author, pages, read);
	myLibrary.push(book);
	// re-render UI when a book is added (if in browser)
	if (typeof document !== 'undefined') renderLibrary();
	return book;
}

// Render all books from myLibrary into the DOM
function renderLibrary() {
	if (typeof document === 'undefined') return;
	const container = document.getElementById('library');
	if (!container) return;

	// clear existing content
	container.innerHTML = '';

	const grid = document.createElement('div');
	grid.className = 'book-grid';

	myLibrary.forEach(book => {
		const card = document.createElement('article');
		card.className = 'book-card';
		card.setAttribute('data-id', book.id);

		const title = document.createElement('h3');
		title.textContent = book.title || 'Untitled';
		card.appendChild(title);

		const author = document.createElement('p');
		author.textContent = `Author: ${book.author || 'Unknown'}`;
		card.appendChild(author);

		const pages = document.createElement('p');
		pages.textContent = `Pages: ${book.pages}`;
		card.appendChild(pages);

		const meta = document.createElement('div');
		meta.className = 'book-meta';
		meta.textContent = `Read: ${book.read ? 'Yes' : 'No'} — id: ${book.id}`;
		card.appendChild(meta);

		grid.appendChild(card);
	});

	container.appendChild(grid);
}

// Expose for debugging in browser console
if (typeof window !== 'undefined') {
	window.myLibrary = myLibrary;
	window.addBookToLibrary = addBookToLibrary;
	window.Book = Book;
}

// Simple test/demo when the script loads in the browser
if (typeof document !== 'undefined') {
	console.log('scripts.js loaded');
	document.addEventListener('DOMContentLoaded', () => {
		console.log('DOM ready — adding demo books');
		// Add a couple of sample books if library is empty
		if (myLibrary.length === 0) {
			addBookToLibrary('Dune', 'Frank Herbert', 412, true);
			addBookToLibrary('1984', 'George Orwell', 328, false);
		}
		renderLibrary();
		console.log('myLibrary:', myLibrary);

		// New Book dialog/form wiring
		const newBookBtn = document.getElementById('new-book-btn');
		const dialog = document.getElementById('new-book-dialog');
		const form = document.getElementById('new-book-form');
		const cancelBtn = document.getElementById('cancel-btn');

		if (newBookBtn && dialog && form) {
			newBookBtn.addEventListener('click', () => {
				if (typeof dialog.showModal === 'function') dialog.showModal();
				else dialog.setAttribute('open', '');
			});

			cancelBtn.addEventListener('click', () => {
				if (typeof dialog.close === 'function') dialog.close();
				else dialog.removeAttribute('open');
				form.reset();
			});

			form.addEventListener('submit', (ev) => {
				ev.preventDefault();
				const data = new FormData(form);
				const title = data.get('title')?.toString().trim();
				const author = data.get('author')?.toString().trim();
				const pages = Number(data.get('pages')) || 0;
				const read = data.get('read') === 'on' || data.get('read') === 'true';

				if (!title || !author) {
					// minimal validation
					alert('Please provide title and author');
					return;
				}

				addBookToLibrary(title, author, pages, read);
				// close and reset
				if (typeof dialog.close === 'function') dialog.close();
				else dialog.removeAttribute('open');
				form.reset();
			});
		}
	});
} else {
	// If running in a non-browser environment (e.g. Node.js), add small test
	if (myLibrary.length === 0) {
		addBookToLibrary('Dune', 'Frank Herbert', 412, true);
		addBookToLibrary('1984', 'George Orwell', 328, false);
		// eslint-disable-next-line no-console
		console.log('myLibrary (node):', myLibrary);
	}
}

