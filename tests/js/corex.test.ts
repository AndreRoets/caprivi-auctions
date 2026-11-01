import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
    addToBid,
    bidError,
    clockOffset,
    firstStepWithError,
    formatAmountInput,
    formatCountdown,
    formatRand,
    initialSellAnswers,
    isSellSectionComplete,
    lotPill,
    photoUrl,
    quickIncrements,
    secondsUntil,
    sellPayload,
    sellPreviewTitle,
    stripNumber,
    type SellAnswers,
} from '../../resources/js/lib/corex.ts';

const answers = (overrides: Partial<SellAnswers> = {}): SellAnswers => ({ ...initialSellAnswers, ...overrides });

describe('money', () => {
    test('formats rand with spaces as thousands separators', () => {
        assert.equal(formatRand(1250000), 'R 1 250 000');
        assert.equal(formatRand(950), 'R 950');
        assert.equal(formatRand(null), '—');
    });

    test('strips everything but digits and turns empty into null', () => {
        assert.equal(stripNumber('R 1,500,000'), 1500000);
        assert.equal(stripNumber(' 2 450 000 '), 2450000);
        assert.equal(stripNumber(''), null);
        assert.equal(stripNumber('none'), null);
    });

    test('formats a typed amount with thousands spaces', () => {
        assert.equal(formatAmountInput('1250000'), '1 250 000');
        assert.equal(formatAmountInput('R1,25'), '125');
        assert.equal(formatAmountInput(''), '');
    });
});

describe('sell questionnaire', () => {
    test('step 1 needs name, email and phone', () => {
        assert.equal(isSellSectionComplete(0, answers({ name: 'Thandi', email: 't@x.co' })), false);
        assert.equal(isSellSectionComplete(0, answers({ name: 'Thandi', email: 't@x.co', phone: '082' })), true);
    });

    test('step 2 needs address and suburb', () => {
        assert.equal(isSellSectionComplete(1, answers({ address: '1 Main Rd' })), false);
        assert.equal(isSellSectionComplete(1, answers({ address: '1 Main Rd', suburb: 'Waterkloof' })), true);
    });

    test('step 3 needs monthly rent only when tenanted', () => {
        assert.equal(isSellSectionComplete(2, answers()), true);
        assert.equal(isSellSectionComplete(2, answers({ occupancy: 'tenant' })), false);
        assert.equal(isSellSectionComplete(2, answers({ occupancy: 'tenant', monthly_rent: '8 500' })), true);
    });

    test('step 4 is complete without a bond, or with the bank named', () => {
        assert.equal(isSellSectionComplete(3, answers()), true);
        assert.equal(isSellSectionComplete(3, answers({ has_bond: true })), false);
        assert.equal(isSellSectionComplete(3, answers({ has_bond: true, bond_bank: 'FNB' })), true);
    });

    test('step 5 needs format and timing', () => {
        assert.equal(isSellSectionComplete(4, answers()), true);
        assert.equal(isSellSectionComplete(4, answers({ timing: '' })), false);
    });

    test('step 6 needs a document or a referral source', () => {
        assert.equal(isSellSectionComplete(5, answers()), false);
        assert.equal(isSellSectionComplete(5, answers({ documents: ['title_deed'] })), true);
        assert.equal(isSellSectionComplete(5, answers({ referral_source: 'Google' })), true);
    });

    test('step 7 needs all three required consents, not marketing', () => {
        assert.equal(isSellSectionComplete(6, answers({ consent_terms: true, consent_authorised: true })), false);
        assert.equal(isSellSectionComplete(6, answers({ consent_terms: true, consent_authorised: true, consent_processing: true })), true);
    });

    test('maps server errors to the first step that contains them', () => {
        assert.equal(firstStepWithError(['consent_terms', 'suburb']), 1);
        assert.equal(firstStepWithError(['monthly_rent']), 2);
        assert.equal(firstStepWithError(['documents.0']), 5);
        assert.equal(firstStepWithError(['email']), 0);
        assert.equal(firstStepWithError(['unknown']), -1);
    });

    test('sends number fields as digits, empty ones as null', () => {
        const payload = sellPayload(answers({ price_expectation: 'R 1,500,000', erf_size: '850 m²', bedrooms: '', website: 'bot' }));

        assert.equal(payload.price_expectation, 1500000);
        assert.equal(payload.erf_size, 850);
        assert.equal(payload.bedrooms, null);
        assert.equal(payload.website, 'bot');
        assert.equal(payload.reserve, 'confidential');
    });

    test('builds the catalogue preview title from the answers', () => {
        assert.equal(sellPreviewTitle({ bedrooms: '3', suburb: 'Waterkloof' }, 'House'), '3-bedroom house in Waterkloof');
        assert.equal(sellPreviewTitle({ bedrooms: '', suburb: '' }, 'Vacant land'), 'vacant land');
        assert.equal(sellPreviewTitle({ bedrooms: '2', suburb: ' ' }, 'Apartment'), '2-bedroom apartment');
    });
});

describe('bid box', () => {
    test('quick buttons are 1x, 2x, 5x and 10x the increment', () => {
        assert.deepEqual(quickIncrements(10000), [10000, 20000, 50000, 100000]);
    });

    test('quick buttons add to the box, starting from at least the minimum bid', () => {
        assert.equal(addToBid('260 000', 260000, 10000), 270000);
        assert.equal(addToBid('270 000', 260000, 20000), 290000);
        assert.equal(addToBid('100 000', 260000, 10000), 270000);
        assert.equal(addToBid('', 260000, 50000), 310000);
    });

    test('blocks amounts below the minimum next bid', () => {
        assert.equal(bidError('250 000', 260000), 'That is too low. Your bid must be at least R 260 000.');
        assert.equal(bidError('260 000', 260000), null);
        assert.equal(bidError('', 260000), 'Enter the amount you want to bid.');
    });
});

describe('countdown and status', () => {
    test('counts down on the server clock, not the visitor clock', () => {
        const clientNow = Date.parse('2026-11-01T10:00:00Z');
        const offset = clockOffset('2026-11-01T10:05:00Z', clientNow);

        assert.equal(offset, 300000);
        assert.equal(secondsUntil('2026-11-01T10:15:00Z', offset, clientNow), 600);
        assert.equal(secondsUntil('2026-11-01T09:00:00Z', offset, clientNow), 0);
        assert.equal(secondsUntil(null, offset, clientNow), null);
    });

    test('formats the remaining time', () => {
        assert.equal(formatCountdown(37934), '10h 32m 14s');
        assert.equal(formatCountdown(2 * 86400 + 65), '2d 0h 01m 05s');
    });

    test('labels lots by phase and result', () => {
        assert.deepEqual(lotPill('open', 'active'), { label: 'Live · bidding open', tone: 'live' });
        assert.deepEqual(lotPill('upcoming', null), { label: 'Upcoming', tone: 'upcoming' });
        assert.deepEqual(lotPill('ended', 'sold'), { label: 'Sold', tone: 'sold' });
        assert.deepEqual(lotPill('ended', 'passed_in'), { label: 'Passed in', tone: 'ended' });
        assert.deepEqual(lotPill('ended', 'closed'), { label: 'Ended', tone: 'ended' });
    });

    test('accepts photos as plain URLs or objects', () => {
        assert.equal(photoUrl('https://x/1.jpg'), 'https://x/1.jpg');
        assert.equal(photoUrl({ url: 'https://x/2.jpg', thumb: 't' }), 'https://x/2.jpg');
        assert.equal(photoUrl({ src: 'https://x/3.jpg' }), 'https://x/3.jpg');
        assert.equal(photoUrl(null), null);
    });
});
