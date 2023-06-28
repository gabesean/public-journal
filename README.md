# Public Journal

## Description

Compose journal entries in this full-stack app built w/ Express + EJS, Mongoose, HTML, SCSS, & Vanilla JS!

This is a project I initiated so I could learn to create a full-stack app in a node environment. I was motivated from the start to create something that the public could use and try straight away without having to go through the steps of creating yet another world wide web account. Accounts are most definitely important and you can create a normal account with this app, I just set out to reduce the initial friction. Now because of this, you would think that there is strong moderation and protections put in place to prevent possible spam. Unfortunately there is not, so that certainly could be a great future feature.

It was honestly pretty eye-opening in how all the parts of "full" come together to create a cohesive app; from dealing with object structures in the mongoDB atlas cluster database, to the front end experience in making sure the user flows are smooth.

I had a lot of fun making this project and I hope you will too by using the demo or cloning the repo or whatever you'd like to do!

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)

## Features

(WIP)

I am unsure if this formatting is the best to showcase features but here they are!

- Modern, responsive, streamlined design
- Create journal entries:
  - Use a TinyMCE editor to write your entry using its GUI or just plain markdown
  - Input a title and then input your content
  - The title field has a maximum character length, the content field **does not**
  - Delete your entries
  - Edit your entries
- Sort journal entries
- Comment on journal entries:
  - Delete your comments
  - Edit your comments
- Automatic (anonymous) account creation:
  - When you create a journal entry or comment without signing up or logging in, you are assigned a randomized, super cool username
  - You don't need to go through the process of creating a "normal" account should you not want to
  - You are able to comment and create journal entries regularly
  - This account type is designed to be used only in a single browser and therefore you cannot "login" to this account on another device/browser
  - When you are using this "anonymous" account, you can opt to **upgrade** to a normal account in Settings:
    - You can choose to use your randomly generated username or choose a new one
    - All your journal entries and comments are then moved over to your newly created normal account
  - Permanently delete your account + data
- Normal account creation (username + password):
  - (WIP) Change your username and/or password
  - Permanently delete your account + data
- Flash notifications to alert the user of important actions

## Installation

**NOTE:** I have been using NodeJS `v16.15.0` for the entirety of this project. Your mileage may vary if you use other versions.

You can start by doing `git clone https://github.com/gabesean/public-journal.git` while in your folder of choice.

To create your own environment variable `.env` file, you can `cd` into the folder that your cloned project is in and `touch .env` to create the file at the root.

This app uses a MongoDB atlas cluster for the database, in the root `index.js` there two important environment variables, `MONGO_KEY` and `CRYPT_KEY`. You would need to provide your own mongoDB auth key, or edit the code to provide a local MongoDB database instead. The `CRYPT_KEY` is used to encrypt the user sessions and save them to a local storage.

Finally, use `npm run dev` to serve up your local dev server.

**NOTE:** The `package.json` start command currently consists of using [nodemon](https://nodemon.io) to start up the server. If you have a preferred way to start the node server, go right ahead!

## Usage

You can visit the demo website for yourself, or you can clone, and find a place to host your own version of this app!

## Credits

I want to thank the amazing developers behind [passportjs](https://www.passportjs.org), [mongoosejs](https://mongoosejs.com), [nodejs](https://nodejs.org), [ejs](https://ejs.co), [dotenv](https://github.com/motdotla/dotenv#readme), [expressjs](https://expressjs.com), [lodash](https://lodash.com), [meaningful-string](https://www.npmjs.com/package/meaningful-string), [sass](https://sass-lang.com) [tinymce](https://tiny.cloud), [bulma](https://bulma.io). I am totally forgetting some, but I digress. Without your genius work, I would not have been able to create and work on this project. Thank you to the stackoverflowers out there who unknowingly provided me some guidance too. <3

## License

I need to choose some sort of license...
