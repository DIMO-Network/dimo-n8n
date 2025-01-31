# n8n-nodes-dimo-api

This is an n8n community node. It lets you use access the DIMO APIs in your n8n workflows.

DIMO is a connected car platform that allows users to take control over their vehicle data, and enables developers/builders to create the next generation of vehicle apps + services.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)   
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Attestation API
	- Create VIN VC
	- Create POM VC

- Authentication API
	- Get Vehicle JWT

- Device Definitions API
	- Decode VIN
	- Search

- Identity API 
	- Custom Identity Query
	- Count DIMO Vehicles

- Telemetry API
	- Custom Telemetry Query
	- Get Vehicle VIN

- Trips API
	- Get Trips

- Valuations API
	- Valuations Lookup
	- Get Instant Offer
	- List Existing Offers

## Credentials

Before getting started, you must sign up via the [DIMO Developer Console](https://console.dimo.org/sign-in) and create an application. Once you've created an application in the Dev Console, you'll obtain a `clientId`, can add a `redirectUri`, and generate an API Key. You'll use these credentials directly within the n8n DIMO Node. More information on the DIMO Developer Console can be found in the [DIMO Developer Docs](https://docs.dimo.org/developer-platform/getting-started/developer-guide/developer-console).

![Adding Credentials](/images/Credentials.jpg)



## Compatibility

_State the minimum n8n version, as well as which versions you test against. You can also include any known version incompatibility issues._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* _[DIMO Developer Documentation](https://docs.dimo.org/developer-platform)_



