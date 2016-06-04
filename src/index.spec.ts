import * as index from "./index";

describe( "index", () => {
	it( "exports the property 'something'", () => {
		expect( "something" in index ).toBeTruthy();
		expect( index.something ).toEqual( "Hello World!" );
	} );
} );
