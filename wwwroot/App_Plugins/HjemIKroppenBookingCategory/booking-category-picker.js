import { BookingPickerBase } from './booking-picker-base.js';

/** Picks a booking category (GET /api/v1/service-categories). Empty means the Book buttons show the whole calendar. */
export default class HjemIKroppenBookingCategoryPicker extends BookingPickerBase {
	endpoint = '/api/v1/service-categories';
	label = 'Bookingkategori';
	emptyOption = 'Ingen kategori (Book viser alle tider)';
	missingOption = 'Kategorien findes ikke længere';
	missingHint = 'Den valgte kategori er slettet i bookingsystemet. Vælg en ny.';
	loadError = 'Kategorierne kunne ikke hentes fra bookingsystemet. Prøv at genindlæse siden.';
}

customElements.define('hjem-i-kroppen-booking-category-picker', HjemIKroppenBookingCategoryPicker);
