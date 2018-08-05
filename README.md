# `micro-vsts`

A tiny microservice that makes adding authentication with VSTS to your application easy.

## Usage

Running your own `micro-vsts` is a single [`now`](https://now.sh) command away:

```sh
# Deploy this repository using now.sh
now colbywhite/micro-vsts -e VSTS_CLIENT_ID=xyz123 -e VSTS_CLIENT_SECRET=asdf123 -e VSTS_SCOPES=vso.build vso.code vso.release -e REDIRECT_URL=https://google.com
```

### Environment variables

You'll need to provide four environment variables when running `micro-vsts`:

```sh
# Your VSTS application client id
VSTS_CLIENT_ID=xyz123
# Your VSTS application client secret
VSTS_CLIENT_SECRET=asdf123
# Your space-separated list of scopes registered to your VSTS application
VSTS_SCOPES=vso.build vso.code vso.release
# The URL to redirect the user to once the authentication was successful
REDIRECT_URL=https://google.com
```

> Create an application on VSTS [here](https://app.vsaex.visualstudio.com/app/register) to get your client id and secret if you haven't done that already.

When authentication was successful, the user will be redirected to the `REDIRECT_URL` with the `access_token` query param set to the VSTS access token. You can then use that token to interact with the [VSTS API](https://docs.microsoft.com/en-us/rest/api/vsts)!

> E.g. setting `REDIRECT_URL=https://google.com` will redirect them to `https://google.com/?access_token=asdf123`. (where `asdf123` is the provided access token)

### Finish setup

To make this work you have to set the authorization callback URL of your application on VSTS to whatever URL `now` gave you plus the path `/callback` e.g. `http://localhost:3000/callback`:

![Authorization callback URL: 'your-url.now.sh'](https://cloud.githubusercontent.com/assets/168870/24585953/9543e03a-178e-11e7-8f10-07be5c10682c.png)

To log people in provide a link to url `now` gave you plus the path `login` e.g. `http://localhost:3000/login` when they click on the link it will redirect to `https://github.com/login/oauth/authorize?client_id=asdf123&state`. (where `client_id` is your VSTS app client id in `.env` and `state` is a randomly generated string). This will redirect them to the VSTS sign in page for your app, which looks like this:

![Authorize my app to access your data on GitHub](https://cloud.githubusercontent.com/assets/7525670/22627265/fc50c680-ebbf-11e6-9126-dcdef37d3c3d.png)

> You can change the scope of the data you can access with the `scope` query param, see the [VSTS docs](https://docs.microsoft.com/en-us/vsts/integrate/get-started/authentication/oauth?view=vsts#scopes)!

When authentication is successful, the user will be redirected to the `REDIRECT_URL` with the access token from VSTS for you to use! 🎉

### Error handling

In case an error happens (either by the service or on GitHub) the user will be redirected to the `REDIRECT_URL` with the `error` query param set to a relevant error message.

## Development

```sh
git clone git@github.com:colbywhite/micro-vsts.git
```

Move `.env.example` to `.env` and fill in your VSTS API details and redirect url

```sh
npm run dev
```

The server will then be listening at `localhost:3000`, so set the authorization callback URL of your dev application on VSTS to `http://localhost:3000/callback`.

## Updating

The `master` branch of this repository is what you will be deploying. To update to a new version with potential bugfixes, all you have to do is run the `now` command again and then set the authorization callback URL on VSTS to the new URL that `now` gave you! 👌

## License

Copyright (c) 2018 Colby M. White, licensed under the MIT license. See [LICENSE.md](LICENSE.md) for more information.
