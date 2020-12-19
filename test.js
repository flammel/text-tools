const expect = chai.expect;

describe('filter', () => {
    describe('deduplicate', () => {
        it('returns no duplicates when some elements are duplicates', () => {
            return expect(filter({ filter: 'deduplicate' })(['a', 'b', 'a', 'c', 'b'])).to.eql(['a', 'b', 'c']);
        });
        it('returns no duplicates when all elements are duplicates', () => {
            return expect(filter({ filter: 'deduplicate' })(['a', 'a', 'a'])).to.eql(['a']);
        });
        it('returns no duplicates when all elements are unique', () => {
            return expect(filter({ filter: 'deduplicate' })(['a', 'b', 'c'])).to.eql(['a', 'b', 'c']);
        });
    });
    describe('unique', () => {
        it('returns only unique lines when some elements are duplicates', () => {
            return expect(filter({ filter: 'unique' })(['a', 'b', 'a', 'c', 'b'])).to.eql(['c']);
        });
        it('returns only unique lines when all elements are duplicates', () => {
            return expect(filter({ filter: 'unique' })(['a', 'a', 'a'])).to.eql([]);
        });
        it('returns only unique lines when all elements are unique', () => {
            return expect(filter({ filter: 'unique' })(['a', 'b', 'c'])).to.eql(['a', 'b', 'c']);
        });
    });
    describe('duplicates', () => {
        it('returns only duplicates when some elements are duplicates', () => {
            return expect(filter({ filter: 'duplicates' })(['a', 'b', 'a', 'c', 'b'])).to.eql(['a', 'b']);
        });
        it('returns only duplicates when all elements are duplicates', () => {
            return expect(filter({ filter: 'duplicates' })(['a', 'a', 'a'])).to.eql(['a']);
        });
        it('returns only duplicates when all elements are unique', () => {
            return expect(filter({ filter: 'duplicates' })(['a', 'b', 'c'])).to.eql([]);
        });
    });
});
