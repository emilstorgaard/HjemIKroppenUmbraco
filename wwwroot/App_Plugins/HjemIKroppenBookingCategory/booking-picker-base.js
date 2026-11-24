import { LitElement, html, css, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';

/**
 * Shared dropdown that lists items from the booking API and stores the chosen item's id as a plain string.
 * The API address is set on the data type (setting "apiUrl"). Subclasses set the endpoint, labels and option text.
 */
export class BookingPickerBase extends UmbElementMixin(LitElement) {
	static properties = {
		value: { type: String },
		readonly: { type: Boolean },
		_items: { state: true },
		_loading: { state: true },
		_error: { state: true }
	};

	/** API path, e.g. `/api/v1/service-categories`. */
	endpoint = '';
	label = '';
	emptyOption = '';
	missingOption = '';
	missingHint = '';
	loadError = '';

	#apiUrl = '';

	constructor() {
		super();
		this.value = '';
		this.readonly = false;
		this._items = [];
		this._loading = true;
		this._error = '';
	}

	/** The text shown for one item in the dropdown. */
	optionName(item) {
		return item.name;
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
			this._error = `Booking-API-adressen mangler. Udfyld den på datatypen "${this.label}".`;
			return;
		}

		this._loading = true;
		this._error = '';
		try {
			const items = [];
			for (let page = 1; page <= 10; page++) {
				const response = await fetch(`${this.#apiUrl}${this.endpoint}?page=${page}&pageSize=100`, {
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) throw new Error(`Booking API responded ${response.status}`);
				const result = await response.json();
				items.push(...result.items);
				if (page >= result.totalPages) break;
			}
			this._items = items;
		} catch (error) {
			console.error(`[${this.label}]`, error);
			this._error = this.loadError;
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
		const missing = current !== '' && !this._items.some((item) => item.id === current);
		const options = [
			{ name: this.emptyOption, value: '', selected: current === '' },
			...(missing ? [{ name: this.missingOption, value: current, selected: true }] : []),
			...this._items.map((item) => ({ name: this.optionName(item), value: item.id, selected: item.id === current }))
		];

		return html`
			${this._error ? html`<p class="error">${this._error}</p>` : nothing}
			<uui-select
				label=${this.label}
				.options=${options}
				?disabled=${this.readonly}
				@change=${this.#onChange}
			></uui-select>
			${missing && !this._error ? html`<p class="hint">${this.missingHint}</p>` : nothing}
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
