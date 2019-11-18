[![Build Status](https://travis-ci.org/akintomiwa-fisayo/CAPSTONE-backend.svg?branch=develop)](https://travis-ci.org/akintomiwa-fisayo/CAPSTONE-backend)
[![Coverage Status](https://coveralls.io/repos/github/akintomiwa-fisayo/CAPSTONE-backend/badge.svg?branch=develop)](https://coveralls.io/github/akintomiwa-fisayo/CAPSTONE-backend?branch=develop)

# CAPSTONE-backend
This repo is the backend to [Akintomiwa Fisayo](https://github.com/akintomiwa-fisayo) [DevCTrainingwithAndela](https://devctraining.andela.com) capstone project

## Table of Content
- [Getting Started](#Getting-Started)
- [Installation and Usage](#Installation-and-Usage)
- [Testing](#Testing)
- [Features](#Features)

## Getting Started
To run this application, you need have installed the  following:
- Node
- Git
- NPM/Yarn (NPM comes with Node)

## Installation and usage
Run the following commands in terminal
##### clone the repo
```
git clone  https://github.com/akintomiwa-fisayo/CAPSTONE-backend.git
```
##### Install dependencies
```
npm i 
```

#####  Start the server
```
npm run start
```
___You should use ```localhost:3000``` as your base url___


## Testing
Execute the command below in terminal to run test
```shell
npm test
```
_or_ 
visit build history https://travis-ci.org/akintomiwa-fisayo/CAPSTONE-backend/pull_requests
## Features
  * Admin can create an employee user account.
  ```node
  POST http://localhost:3000/auth/create-user
  ```
  >
 * Admin/Employees can sign in.
  ```node
  POST http://localhost:3000/auth/signin
  ```
  >
  * Admin can get all get all reported contents (article and gif posts and comments).
  ```node
  GET http://localhost:3000/reports
  ```
  >
  * Admin can take action on a specific reported content (article or gif post or comment).
  ```node
  PATCH http://localhost:3000/reports/:id
  ```
  >
 * Admin/Employees can change thier password.
  ```node
  PATCH http://localhost:3000/auth/password
  ```
  >
 * Admin/Employees can get public non-sensitive details about a specific user.
  ```node
  GET http://localhost:3000/users/:id
  ```
  >
 * Admin/Employees can create an article post .
  ```node
  POST http://localhost:3000/articles
  ```
  >
 * Admin/Employees can get a specific article post of thiers.
  ```node
  GET http://localhost:3000/articles/:id
  ```
  >
  * Admin/Employees can modify a specific article post of thiers.
  ```node
  PATCH http://localhost:3000/articles/:id
  ```
  >
  * Admin/Employees can delete a specific article post of thiers.
  ```node
  DELETE http://localhost:3000/articles/:id
  ```
  >
  * Admin/Employees can report a specific article post.
  ```node
  POST http://localhost:3000/articles/:id/flag
  ```
  >
  * Admin/Employees can create a comment for a specific article post.
  ```node
  POST http://localhost:3000/articles/:id/comment
  ```
  >
  * Admin/Employees can report a specific comment for a specific article post.
  ```node
  POST http://localhost:3000/articles/:id/comment/:commentId/flag
  ```
  >
 * Admin/Employees can create a gif post.
  ```node
  POST http://localhost:3000/gifs
  ```
  >
 * Admin/Employees can get a specific gif post of thiers.
  ```node
  GET http://localhost:3000/gifs/:id
  ```
  >
  * Admin/Employees can modify a specific gif post (title) of thiers.
  ```node
  PATCH http://localhost:3000/gifs/:id
  ```
  >
  * Admin/Employees can delete a specific gif post of thiers.
  ```node
  DELETE http://localhost:3000/gifs/:id
  ```
  >
  * Admin/Employees can report a specific gif post.
  ```node
  POST http://localhost:3000/gifs/:id/flag
  ```
  >
  * Admin/Employees can create a comment for a specific gif post.
  ```node
  POST http://localhost:3000/gifs/:id/comment
  ```
  >
  * Admin/Employees can report a specific comment for a specific gif post.
  ```node
  POST http://localhost:3000/gifs/:id/comment/:commentId/flag
  ```
  >
  * Admin/Employees can get all article and gif posts showing the most recently posted articles or gifs first.
  ```node
  GET http://localhost:3000/feed
  ```
  >