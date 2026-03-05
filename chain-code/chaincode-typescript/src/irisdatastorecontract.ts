/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { HelperUtill } from './utils/chaincodeUtil';
import { Timestamp } from 'fabric-shim';
import { IrisDetails } from './models/irisdetails';
import { createHash } from 'crypto';
import { Buffer } from 'buffer'; // Node.js Buffer is available

const PREFIX = "VOTER_";
const VOTEPREFIX = "CASTE_";

@Info({ title: 'IrisDataStoreContract', description: 'Chaincode  for the iris device auth.' })
export class IrisDataStoreContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const contractInfo: any = {

            docType: 'SmartContcatInfo',
            Version: '1.0',
            Name: "IrisDataStoreContract"
        };
        await ctx.stub.putState("ChainCodeInfo", Buffer.from(stringify(sortKeysRecursive(contractInfo))));


    }


    @Transaction()
    @Returns('string')
    public async registerVoter(ctx: Context, voterDetails: string, imageBase64: string): Promise<string> {
        const voter: any = HelperUtill.parseArgs(voterDetails);
        const voterId = voter.voterId.toString().toUpperCase().trim();
        const constituency = voter.constituency.toString().toUpperCase().trim();
        const exists = await this.assetExists(ctx, PREFIX + voterId);
        if (exists) {
            throw new Error(`Voter with same  ${voterId} already exists`);
        }
        // Decode base64 → bytes (client sends base64 to avoid binary arg issues)
        let imageBuffer: Buffer;
        try {
            imageBuffer = Buffer.from(imageBase64, 'base64');
        } catch (err) {
            throw new Error('Invalid base64 image data');
        }

        const MAX_SIZE = 1000 * 1024; // 500 KB hard limit – adjust as needed
        if (imageBuffer.length > MAX_SIZE) {
            throw new Error(`Image too large (${imageBuffer.length} bytes). Max allowed: ${MAX_SIZE} bytes`);
        }
        // Compute SHA-256 hash
        const hash = createHash('sha256');
        hash.update(imageBuffer);
        const hashHex = hash.digest('hex');
        const hashExits = await this.assetExists(ctx, hashHex);
        if (hashExits) {
            throw new Error(`Image already exists! Duplicate  image not allowed!`);
        }
        const imageName = voter.imageName ? voter.imageName.toString().trim() : '';
        const irisDetails: any = {
            name: voter.name.toString().trim(),
            voterId,
            constituency,
            address: voter.address.toString().trim(),
            imageName,
            pHash: voter.pHash,
            imagehash: hashHex.toString(),
            imageData: Uint8Array.from(imageBuffer), // or just imageBuffer
        };
        await ctx.stub.putState(hashHex.toString(), Buffer.from(voterId));
        const txID = ctx.stub.getTxID();
        await ctx.stub.putState(PREFIX + voterId, Buffer.from(stringify(sortKeysRecursive(irisDetails))));
        ctx.stub.setEvent('VoterRegisterd', Buffer.from(JSON.stringify({ voterId, imagehash: hashHex })));
        return `${voterId} Saved Successfully With TxId:${txID}`;

    }


    @Transaction(false)
    @Returns('string')
    public async findVoterDetailsByVoterId(ctx: Context, voterId: string): Promise<string> {

        if (!voterId) throw new Error('voterId  is required');
        const assetJSON = await ctx.stub.getState(PREFIX + voterId.toUpperCase().trim());
        if (!assetJSON || assetJSON.length === 0) throw new Error(`The  ${voterId} does not exist`);
        const Record = JSON.parse(assetJSON.toString());
        return stringify(sortKeysRecursive(Record));
    }

    @Transaction(false)
    @Returns('string')
    public async verifyByImage(ctx: Context, newImageBase64: string): Promise<string> {
        let newBuffer: Buffer;
        try {
            newBuffer = Buffer.from(newImageBase64, 'base64');
        } catch (err) {
            throw new Error('Invalid base64 for new image');
        }

        // Compute hash of submitted image
        const hash = createHash('sha256');
        hash.update(newBuffer);
        const newHashHex = hash.digest('hex');
        const assetJSON = await ctx.stub.getState(newHashHex.toString());

        const errorDetails: any = {
            error: true,
            message: 'No matching image hash found!'
        };
        if (!assetJSON || assetJSON.length === 0) {
            return stringify(sortKeysRecursive(errorDetails));
        }

        const voterId = assetJSON.toString();

        const voterAssetJSON = await ctx.stub.getState(PREFIX + voterId);
        if (!voterAssetJSON || voterAssetJSON.length === 0) {
            return `No data found for voterId: ${voterId}`;
        }

        const Record = JSON.parse(voterAssetJSON.toString());
        return stringify(sortKeysRecursive(Record));
    }


    @Transaction(false)
    @Returns('string')
    public async QueryAllVoters(ctx: Context): Promise<string> {
        const startKey = 'VOTER_';
        const endKey = 'VOTER_~';
        const electionIterator = await ctx.stub.getStateByPartialCompositeKey(
            "ELECTION",
            []
        );

        let activeElectionId: string | null = null;
        let res = await electionIterator.next();

        while (!res.done) {

            const election = JSON.parse(res.value.value.toString());

            if (election.isActive.toString().toLowerCase() === 'true') {

                activeElectionId = election.electionId;
                break;
            }

            res = await electionIterator.next();
        }

        await electionIterator.close();

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const voters = await this.collectResults(ctx, iterator, activeElectionId);
        return JSON.stringify(voters);
    }


    private async collectResults(ctx: Context, iterator: any, activeElectionId: string | null): Promise<any[]> {
        const results: any[] = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value) {
                const str = res.value.value.toString('utf8');
                try {
                    let obj = JSON.parse(str);
                    const isVoted = await this.assetExists(ctx, activeElectionId + "~" + obj.voterId);
                    obj.hasVoted = isVoted;
                    delete obj.imageData;
                    delete obj.pHash;
                    results.push(obj);
                } catch {
                    results.push(str);
                }
            }
            res = await iterator.next();
        }

        await iterator.close();
        return results;
    }

    @Transaction()
    @Returns('string')
    public async createElection(ctx: Context, dataVal: string): Promise<string> {


        const args: any = HelperUtill.parseArgs(dataVal);

        const title = args.title?.toString().toUpperCase().trim();
        const electionDate = args.electionDate?.toString().trim();
        const isActive = "true";

        if (!title || !electionDate) {
            throw new Error("Title and electionDate are required");
        }

        const electionId = args.electionId.toString().toUpperCase().trim();

        const electionKey = ctx.stub.createCompositeKey("ELECTION", [electionId]);

        const electionData: any = {
            docType: "election",
            electionId,
            title,
            electionDate,
            isActive

        };

        await ctx.stub.putState(
            electionKey,
            Buffer.from(stringify(sortKeysRecursive(electionData)))
        );

        return stringify(sortKeysRecursive({
            success: true,
            message: "Election created successfully",
            txId: ctx.stub.getTxID(),
            data: electionData
        }));

    }

    @Transaction()
    @Returns('string')
    public async createCandidate(ctx: Context, dataVal: string): Promise<string> {
        const candidates: any[] = HelperUtill.parseArgs(dataVal);

        if (!Array.isArray(candidates) || candidates.length === 0) {
            throw new Error("Input must be a non-empty array of candidates");
        }

        const txId = ctx.stub.getTxID();
        const createdCandidates: string[] = [];

        for (const item of candidates) {

            const electionId = item.electionId?.toString().toUpperCase().trim();
            const candidateId = item.candidateId?.toString().toUpperCase().trim();
            const imagePath = item.imagePath.toString().trim();
            const name = item.name.toString().toUpperCase().trim();
            const party = item.party?.toString().toUpperCase().trim();
            const isActive = "true";

            if (!electionId || !candidateId) {
                throw new Error("ElectionId and CandidateId are required");
            }

            const electionKey = ctx.stub.createCompositeKey("ELECTION", [electionId]);

            const electionBytes = await ctx.stub.getState(electionKey);


            if (!electionBytes || electionBytes.length === 0) {

                throw new Error(`Election ${electionId} does not exist`);
            }

            // 🔐 2. Use Composite Key for Candidate
            const candidateKey = ctx.stub.createCompositeKey(
                "CANDIDATE",
                [electionId, candidateId]
            );

            const exists = await ctx.stub.getState(candidateKey);
            if (exists && exists.length > 0) {
                throw new Error(`Candidate ${candidateId} already exists for election ${electionId}`);
            }


            const candidateData: any = {
                docType: "candidate",
                electionId,
                candidateId,
                imagePath,
                name,
                party,
                totalVote: 0,
                isActive

            };

            await ctx.stub.putState(
                candidateKey,
                Buffer.from(stringify(sortKeysRecursive(candidateData)))
            );

            createdCandidates.push(candidateId);

        }

        return stringify(sortKeysRecursive({
            success: true,
            message: "Candidates created successfully",
            txId
        }));
    }
    @Transaction()
    @Returns('string')
    public async castVote(
        ctx: Context,
        electionId: string,
        candidateId: string,
        voterId: string
    ): Promise<string> {

        electionId = electionId.toUpperCase().trim();
        candidateId = candidateId.toUpperCase().trim();
        voterId = voterId.toUpperCase().trim();

        const txId = ctx.stub.getTxID();

        // 1️⃣ Validate Election Exists
        const electionKey = ctx.stub.createCompositeKey("ELECTION", [electionId]);
        const electionBytes = await ctx.stub.getState(electionKey);

        if (!electionBytes || electionBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }

        // 2️⃣ Validate Candidate Exists
        const candidateKey = ctx.stub.createCompositeKey(
            "CANDIDATE",
            [electionId, candidateId]
        );

        const candidateBytes = await ctx.stub.getState(candidateKey);
        if (!candidateBytes || candidateBytes.length === 0) {
            throw new Error(`Candidate ${candidateId} not found`);
        }

        // 3️⃣ Prevent Double Voting
        const voteKey = ctx.stub.createCompositeKey(
            "VOTE",
            [electionId, voterId]
        );

        const voteExists = await ctx.stub.getState(voteKey);
        if (voteExists && voteExists.length > 0) {
            throw new Error("Voter has already voted in this election");
        }

        // 4️⃣ Atomic Vote Increment
        const candidate = JSON.parse(candidateBytes.toString());
        candidate.totalVote = (candidate.totalVote || 0) + 1;

        await ctx.stub.putState(
            candidateKey,
            Buffer.from(stringify(sortKeysRecursive(candidate)))
        );

        // 5️⃣ Store Vote Audit Record
        const voteRecord = {
            docType: "vote",
            electionId,
            voterId,
            candidateId
        };

        await ctx.stub.putState(
            voteKey,
            Buffer.from(stringify(sortKeysRecursive(voteRecord)))
        );

        await ctx.stub.putState(
            electionId + "~" + voterId,
            Buffer.from("true"));


        // 6️⃣ Emit Event (Real-time dashboard)
        ctx.stub.setEvent("VoteCast", Buffer.from(JSON.stringify({
            electionId,
            candidateId,
            totalVote: candidate.totalVote
        })));

        return stringify(sortKeysRecursive({
            success: true,
            message: "Vote cast successfully",
            txId,
            totalVote: candidate.totalVote
        }));
    }
    @Transaction(false)
    @Returns('string')
    public async getElectionResults(
        ctx: Context,
        electionId: string
    ): Promise<string> {

        electionId = electionId.toUpperCase().trim();

        const iterator = await ctx.stub.getStateByPartialCompositeKey(
            "CANDIDATE",
            [electionId]
        );

        const results: any[] = [];
        let res = await iterator.next();

        while (!res.done) {
            const candidate = JSON.parse(res.value.value.toString());

            results.push({
                candidateId: candidate.candidateId,
                name: candidate.name,
                party: candidate.party,
                totalVote: candidate.totalVote
            });

            res = await iterator.next();
        }

        await iterator.close();

        // Sort descending by vote
        results.sort((a, b) => b.totalVote - a.totalVote);

        return stringify(sortKeysRecursive({
            success: true,
            electionId,
            totalCandidates: results.length,
            results
        }));
    }
    @Transaction(false)
    @Returns('string')
    public async queryAllElections(ctx: Context): Promise<string> {

        const iterator = await ctx.stub.getStateByPartialCompositeKey(
            "ELECTION",
            []
        );

        const elections: any[] = [];
        let res = await iterator.next();

        while (!res.done) {
            const election = JSON.parse(res.value.value.toString());
            elections.push(election);
            res = await iterator.next();
        }

        await iterator.close();

        return stringify(sortKeysRecursive({
            success: true,
            totalElections: elections.length,
            data: elections
        }));
    }
    @Transaction(false)
    @Returns('string')
    public async queryCandidatesByElection(ctx: Context, electionId: string): Promise<string> {

        electionId = electionId.toUpperCase().trim();

        const iterator = await ctx.stub.getStateByPartialCompositeKey(
            "CANDIDATE",
            [electionId]
        );

        const results: any[] = [];
        let res = await iterator.next();

        while (!res.done) {
            const record = JSON.parse(res.value.value.toString());
            results.push(record);
            res = await iterator.next();
        }

        await iterator.close();

        return stringify(sortKeysRecursive({
            success: true,
            total: results.length,
            data: results
        }));
    }

    /**
     * 
     * @param ctx 
     * @param dataVal 
     * @returns 
     */


    @Transaction()
    @Returns('string')
    public async casteVoteForEelection(ctx: Context, dataVal: string): Promise<string> {
        const args: any = HelperUtill.parseArgs(dataVal);
        let voterId = args.voterId.toString().toUpperCase().trim();
        let candiadteName = args.candidateName.toString().toUpperCase().trim();
        let electionName = args.electionName.toString().toUpperCase().trim();
        let assetJSON = await ctx.stub.getState(PREFIX + voterId.toUpperCase().trim());
        if (!assetJSON || assetJSON.length === 0) throw new Error(`The  ${voterId} does not exist`);
        let key = VOTEPREFIX + electionName + "_" + voterId;
        assetJSON = await ctx.stub.getState(key);
        if (assetJSON && assetJSON.length > 0)
            throw new Error(`The  ${voterId} alredy casted the vote`);
        const txID = ctx.stub.getTxID();
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(args))));
        return `The voter with  voter ID  ${voterId} cast his vote successfully. The chain transction id is TxId:${txID}`;
    }


    /**
     * 
     * Deactivate the active election.
     * @param ctx 
     * @returns 
     */


    @Transaction()
    @Returns('string')
    public async deactivateLastActiveElection(ctx: Context): Promise<string> {

        const iterator = await ctx.stub.getStateByPartialCompositeKey(
            "ELECTION",
            []
        );

        let activeElectionKey: string | null = null;
        let activeElection: any = null;

        let res = await iterator.next();

        while (!res.done) {

            const election = JSON.parse(res.value.value.toString());

            if (election.isActive === true || election.isActive === "TRUE") {
                activeElectionKey = res.value.key;
                activeElection = election;
                break; // Assuming only one active election at a time
            }

            res = await iterator.next();
        }

        await iterator.close();

        // ❌ No active election found
        if (!activeElectionKey) {
            return stringify(sortKeysRecursive({
                success: false,
                message: "No active election present"
            }));
        }

        // ✅ Deactivate election
        activeElection.isActive = false;
        activeElection.deactivatedAt = new Date().toISOString();
        activeElection.deactivatedTxId = ctx.stub.getTxID();

        await ctx.stub.putState(
            activeElectionKey,
            Buffer.from(stringify(sortKeysRecursive(activeElection)))
        );

        return stringify(sortKeysRecursive({
            success: true,
            message: `Election ${activeElection.electionId} deactivated successfully`,
            txId: ctx.stub.getTxID(),
            data: activeElection
        }));
    }

    @Transaction(false)
    @Returns('string')
    public async getActiveElectionDashboard(ctx: Context): Promise<string> {



        // 1️⃣ Find Active Election
        const electionIterator = await ctx.stub.getStateByPartialCompositeKey(
            "ELECTION",
            []
        );

        let activeElection: any = null;
        let activeElectionId: string | null = null;

        let res = await electionIterator.next();

        while (!res.done) {

            const election = JSON.parse(res.value.value.toString());

            if (election.isActive.toString().toLowerCase() === 'true') {
                activeElection = election;
                activeElectionId = election.electionId;
                break;
            }

            res = await electionIterator.next();
        }

        await electionIterator.close();

        if (!activeElectionId) {
            return stringify(sortKeysRecursive({
                success: false,
                message: "No active election present"
            }));
        }

        // 2️⃣ Get Candidates + Vote Counts
        const candidateIterator = await ctx.stub.getStateByPartialCompositeKey(
            "CANDIDATE",
            [activeElectionId]
        );

        const candidates: any[] = [];
        let totalVotes = 0;

        let candRes = await candidateIterator.next();

        while (!candRes.done) {

            const candidate = JSON.parse(candRes.value.value.toString());

            totalVotes += candidate.totalVote || 0;
            candidates.push({
                candidateId: candidate.candidateId,
                name: candidate.name,
                party: candidate.party,
                imagePath: candidate.imagePath,
                totalVote: candidate.totalVote || 0
            });



            candRes = await candidateIterator.next();
        }

        await candidateIterator.close();

        // 3️⃣ Count Total Voters Who Cast Votes
        const voteIterator = await ctx.stub.getStateByPartialCompositeKey(
            "VOTE",
            [activeElectionId]
        );

        let totalVoters = 0;
        let voteRes = await voteIterator.next();

        while (!voteRes.done) {
            totalVoters++;
            voteRes = await voteIterator.next();
        }

        await voteIterator.close();

        // 4️⃣ Sort Candidates by Votes (Leaderboard)
        candidates.sort((a, b) => b.totalVote - a.totalVote);

        return stringify(sortKeysRecursive({
            success: true,
            election: {
                electionId: activeElection.electionId,
                title: activeElection.title,
                electionDate: activeElection.electionDate


            },
            statistics: {
                totalCandidates: candidates.length,
                totalVotesCast: totalVotes,
                totalVotersParticipated: totalVoters
            },
            candidates
        }));
    }

    @Transaction(false)
    @Returns('string')
    public async isActiveElectionPresent(ctx: Context): Promise<string> {

        const iterator = await ctx.stub.getStateByPartialCompositeKey(
            "ELECTION",
            []
        );

        let res = await iterator.next();

        while (!res.done) {

            const election = JSON.parse(res.value.value.toString());

            if (election.isActive === true) {
                await iterator.close();

                return stringify({
                    success: true,
                    activeElectionPresent: true,
                    electionId: election.electionId,
                    title: election.title
                });
            }

            res = await iterator.next();
        }

        await iterator.close();

        return stringify({
            success: true,
            activeElectionPresent: false,
            message: "No active election present"
        });
    }

    /**
     * Check data for the device exits.
     * @param {*} ctx 
     * @param {*} key 
     * @returns 
     */
    @Transaction(false)
    @Returns('boolean')
    public async assetExists(ctx: Context, key: string): Promise<boolean> {

        if (!key) throw new Error('key is required');
        const assetJSON = await ctx.stub.getState(key);
        if (!assetJSON || assetJSON.length === 0) return false;
        return true;
    }

    /**
     * Ge the details using couchdb selector query.
     * @param {*} ctx 
     * @param {*} args 
     * @returns 
     */
    @Transaction(false)
    @Returns('string')
    public async query(ctx: Context, args: string): Promise<string> {

        try {

            JSON.parse(args);

        } catch (error) {

            throw new Error('transaction argument must be a stringified object');
        }
        const { query } = JSON.parse(args);
        if (!query) throw new Error('query is required');
        const allResults = await HelperUtill.getQueryResult(ctx, query);
        return JSON.stringify(allResults);
    }

    @Transaction(false)
    public async ClientAccountID(ctx: Context): Promise<string> {
        const clientAccountID = ctx.clientIdentity.getID();
        return clientAccountID;
    }




}
