import { Context } from 'fabric-contract-api';

export class HelperUtill {

    public static parseArgs(arg: string): any {
        let argumentsObject = {};
        try {
            argumentsObject = JSON.parse(arg);
        } catch (error) {
            throw new Error('transaction second argument must be a stringified object');
        }
        return argumentsObject;
    }

    public static async getQueryResult(ctx: Context, query: string): Promise<any[]> {

        const iterator = await ctx.stub.getQueryResult(query);
        const allResults = [];

        while (true) {

            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {

                const Key = res.value.key;
                let Record: any;

                try {

                    Record = JSON.parse(res.value.value.toString());

                } catch (err) {

                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }


    public static async getAllResults(iterator: any, isHistory: boolean, unit: string): Promise<any[]> {

        let allResults = [];

        while (true) {

            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {

                let jsonRes: any = {};

                if (isHistory && isHistory === true) {


                    try {

                        jsonRes = JSON.parse(res.value.value.toString('utf8'));

                        if (unit.trim() === 'ft3/s') {
                            jsonRes.quantity.unit = 'ft3/s';
                            jsonRes.quantity.value = jsonRes.quantity.value * 35.314667;
                        }

                    } catch (err) {
                        console.log(err);
                        jsonRes = res.value.value.toString('utf8');
                    }

                } else {
                    // jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                return allResults;
            }
        }
    }





}