import { BookingPickerBase } from './booking-picker-base.js';

/** Picks an active service type (GET /api/v1/service-types), shown as "Kategori – Ydelse". */
export default class HjemIKroppenBookingServiceTypePicker extends BookingPickerBase {
	endpoint = '/api/v1/service-types';
	label = 'Bookingydelse';
	emptyOption = 'Vælg ydelse';
	missingOption = 'Ydelsen findes ikke længere eller er deaktiveret';
	missingHint = 'Den valgte ydelse er slettet eller deaktiveret i bookingsystemet. Vælg en ny.';
	loadError = 'Ydelserne kunne ikke hentes fra bookingsystemet. Prøv at genindlæse siden.';

	optionName(item) {
		return `${item.category.name} – ${item.name}`;
	}
}

customElements.define('hjem-i-kroppen-booking-service-type-picker', HjemIKroppenBookingServiceTypePicker);
