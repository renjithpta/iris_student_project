/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class IrisDetails {


    @Property()
    public name: string;

    @Property()
    public address: string;

    @Property()
    public imagehash: string;
    
    @Property()
    public pHash: string;

    
    @Property()
    public imageData: Uint8Array;

    
    @Property()
    public constituency: string;

    @Property()
    public imagePath: string;

}
