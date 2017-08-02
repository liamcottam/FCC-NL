# FCC-NL
A project created for freeCodeCamp Backend Certification.

# Getting Started

## You will need:
- [MongoDB](https://mlab.com/welcome/)
- [Google Places API Token](https://developers.google.com/places/web-service/get-api-key)
- [Yelp API API Token](https://www.yelp.co.uk/developers)
- [Yelp GraphQL Beta Access](https://www.yelp.co.uk/developers/graphql/guides/intro)
- [Twitter OAuth Keys](https://dev.twitter.com/resources/signup)
- [GitHub OAuth Keys](https://github.com/settings/developers)

You will need to manually request an OAuth token for the Yelp API which should be valid for 160 days as I do not handle network calls to re-request a token.

Below is a postman request to do this for you, you will need to enter your `client_id` and `client_secret` in the environment variables which you can read more up on [here](https://www.getpostman.com/docs/postman/environments_and_globals/manage_environments).

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/2ae20360e033531eed10#?env%5BYelp%20API%5D=W3siZW5hYmxlZCI6dHJ1ZSwia2V5IjoiY2xpZW50X2lkIiwidmFsdWUiOiIiLCJ0eXBlIjoidGV4dCJ9LHsiZW5hYmxlZCI6dHJ1ZSwia2V5IjoiY2xpZW50X3NlY3JldCIsInZhbHVlIjoiIiwidHlwZSI6InRleHQifSx7ImVuYWJsZWQiOnRydWUsImtleSI6ImFjY2Vzc190b2tlbiIsInZhbHVlIjoiIiwidHlwZSI6InRleHQifV0=)

## Once that's done...
1. Copy `.env.example` to `.env` file and fill in all **all** fields

`cp .env.example .env && vim .env`

2. Install the application dependencies 

`yarn install`

3. Run the server

`yarn run dev`

## Running in production mode
Although this application isn't highly tested and is **not production ready**, you can however minify assets.

1. Compile the assets

```yarn run build```

2. Run the server

```yarn run serve```
