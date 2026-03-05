## Adding org5 to the test network

You can use the `addorg4.sh` script to add another organization to the Fabric test network. The `addorg4.sh` script generates the org5 crypto material, creates an org5 organization definition, and adds org5 to a channel on the test network.

You first need to run `./network.sh up createChannel` in the `test-network` directory before you can run the `addorg4.sh` script.

```
./network.sh up createChannel
cd addorg4
./addorg4.sh up
```

If you used `network.sh` to create a channel other than the default `irischannel`, you need pass that name to the `addorg4.sh` script.
```
./network.sh up createChannel -c channel1
cd addorg4
./addorg4.sh up -c channel1
```

You can also re-run the `addorg4.sh` script to add org5 to additional channels.
```
cd ..
./network.sh createChannel -c channel2
cd addorg4
./addorg4.sh up -c channel2
```

For more information, use `./addorg4.sh -h` to see the `addorg4.sh` help text.
