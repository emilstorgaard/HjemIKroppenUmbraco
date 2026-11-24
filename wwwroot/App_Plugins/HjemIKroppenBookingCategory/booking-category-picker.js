import { LitElement, html, css, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';

/**
 * Lets the editor pick one of the booking categories from the booking API (GET /api/v1/service-categories).
 * Stores the category id as a plain string. An empty value means "no category": the page's Book buttons then show the
 * whole calendar. The API address is set on the data type (setting "apiUrl").
 */
export default class HjemIKroppenBookingCategoryPicker extends UmbElementMixin(LitElement) {
	static properties = {
		value: { type: String },
		readonly: { type: Boolean },
		_categories: { state: true },
		_loading: { state: true },
		_error: { state: true }
	};

	#apiUrl = '';

	constructor() {
		super();
		this.value = '';
		this.readonly = false;
		this._categories = [];
		this._loading = true;
		this._error = '';
	}

	set config(config) {
		const apiUrl = (config?.getValueByAlias('apiUrl') ?? '').trim().replace(/\/+$/, '');
		if (apiUrl === this.#apiUrl && !this._error) return;
		this.#apiUrl = apiUrl;
		this.#load();
	}

	async #load() {
		if (!this.#apiUrl) {
			this._loading = false;
			this._error = 'Booking-API-adressen mangler. Udfyld den på datatypen "Bookingkategori".';
			return;
		}

		this._loading = true;
		this._error = '';
		try {
			const categories = [];
			for (let page = 1; page <= 10; page++) {
				const response = await fetch(`${this.#apiUrl}/api/v1/service-categories?page=${page}&pageSize=100`, {
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) throw new Error(`Booking API responded ${response.status}`);
				const result = await response.json();
				categories.push(...result.items);
				if (page >= result.totalPages) break;
			}
			this._categories = categories;
		} catch (error) {
			console.error('[Bookingkategori]', error);
			this._error = 'Kategorierne kunne ikke hentes fra bookingsystemet. Prøv at genindlæse siden.';
		} finally {
			this._loading = false;
		}
	}

	#onChange(event) {
		this.value = event.target.value;
		this.dispatchEvent(new UmbChangeEvent());
	}

	render() {
		if (this._loading) return html`<uui-loader-bar></uui-loader-bar>`;

		const current = this.value ?? '';
		const unknown = current !== '' && !this._categories.some((c) => c.id === current);
		const options = [
			{ name: 'Ingen kategori (Book viser alle tider)', value: '', selected: current === '' },
			...(unknown ? [{ name: 'Kategorien findes ikke længere', value: current, selected: true }] : []),
			...this._categories.map((c) => ({ name: c.name, value: c.id, selected: c.id === current }))
		];

		return html`
			${this._error ? html`<p class="error">${this._error}</p>` : nothing}
			<uui-select
				label="Bookingkategori"
				.options=${options}
				?disabled=${this.readonly}
				@change=${this.#onChange}
			></uui-select>
			${unknown ? html`<p class="hint">Den valgte kategori er slettet i bookingsystemet. Vælg en ny.</p>` : nothing}
		`;
	}

	static styles = css`
		uui-select {
			width: 100%;
		}
		.error {
			margin: 0 0 var(--uui-size-space-3);
			color: var(--uui-color-danger);
		}
		.hint {
			margin: var(--uui-size-space-2) 0 0;
			color: var(--uui-color-text-alt);
		}
	`;
}

customElements.define('hjem-i-kroppen-booking-category-picker', HjemIKroppenBookingCategoryPicker);
