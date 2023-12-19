const express = require('express');
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const ArrayType = require('ref-array-di')(ref);
const app = express();
const port = 3001;

// Define the types
const voidPtr = ref.refType(ref.types.void);
const cstring = ref.refType(ref.types.char);

// Load the DLL
const my_dll = ffi.Library('CapsuleClient.dll', {
  'clCClient_GetVersionString': [voidPtr, []],
  'clCString_CStr': [cstring, [voidPtr]],
  'clCString_Free': [voidPtr, [voidPtr]],
  'clCClient_CreateWithName': [voidPtr, [cstring]],
  'clCClient_GetClientName': [voidPtr, [voidPtr]],
  'clCClient_Connect': ['void', [voidPtr, cstring]],
  'clCClient_Update': ['void', [voidPtr]],
  'clCClient_Disconnect': ['void', [voidPtr]],
  // Add more functions as necessary...
});

let client;

function get_client_version() {
  const versionStrPtr = my_dll.clCClient_GetVersionString();
  const versionStr = my_dll.clCString_CStr(versionStrPtr).readCString();
  console.log(`Version of the library: ${versionStr}`);
  my_dll.clCString_Free(versionStrPtr);
}

function create_client() {
  const clientNameArg = Buffer.from("SkyBrain Neurotech", 'utf-8');
  client = my_dll.clCClient_CreateWithName(clientNameArg);
  const clientNamePtr = my_dll.clCClient_GetClientName(client);
  const clientName = my_dll.clCString_CStr(clientNamePtr).readCString();
  console.log(`Client name of the library: ${clientName}`);
  my_dll.clCString_Free(clientNamePtr);
}

function connect_client() {
  my_dll.clCClient_Connect(client, Buffer.from("inproc://capsule", 'utf-8'));
}

function disconnect_client() {
  for (let i = 0; i < 100; i++) {
    my_dll.clCClient_Update(client);
    // Sleep for 50ms using a promise
    new Promise(resolve => setTimeout(resolve, 50));
  }
  my_dll.clCClient_Disconnect(client);
}

get_client_version();
create_client();
connect_client();
disconnect_client();

app.get('/getLibraryVersion', (req, res) => {
  const versionStrPtr = my_dll.clCClient_GetVersionString();
  const versionStr = my_dll.clCString_CStr(versionStrPtr).readCString();
  my_dll.clCString_Free(versionStrPtr);
  res.send(versionStr);
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
