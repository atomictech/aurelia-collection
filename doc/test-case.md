# `aurelia-collection` use cases

## Backend Database State

```JavaScript
Phones [
  {
    _id: 'phone1',
    _ref_owner: 'user1',
    screens: [
      {
        _ref_screen: 'screen1',
        _ref_apps: ['app1', 'app2']
      },
      {
        _ref_screen: 'screen2',
        _ref_apps: ['app3', 'app4']
      }
    ]
  }
]

Users [
  {
    _id: 'user1',
    name: 'User #1'
  }
]

Screens [
  {
    _id: 'screen1',
    index: 1
  },
  {
    _id: 'screen2',
    index: 2
  }
]

Apps [
  {
    _id: 'app1',
    name: 'App #1'
  },
  {
    _id: 'app2',
    name: 'App #2'
  },
  {
    _id: 'app3',
    name: 'App #3'
  },
  {
    _id: 'app4',
    name: 'App #4'
  },
  {
    _id: 'app5',
    name: 'App #5'
  }
]
```

---

## Scenarios

### General collection configuration:

```JavaScript
let userCollection = config.registerCollection('Users', 'api/users/', Collection, creator);
let screenCollection = config.registerCollection('Screens', 'api/screens/', Collection, creator);
let appCollection = config.registerCollection('Apps', 'api/apps/', Collection, creator);
let phoneCollection = config.registerCollection('Phone', 'api/phones/', Collection, creator);
phoneCollection.refKeys = () => [
  { backendKey: '_ref_owner', collection: 'Users', frontendKey: 'owner' },
  { backendKey: 'screens._ref_screen', collection: 'Screens', frontendKey: 'screen' },
  { backendKey: 'screens._ref_apps', collection: 'Apps', frontendKey: 'apps' }
];
```

### 1. As a user I want to add `App#app5` in `Phone#phone1` second screen `Screen#screen2`.

#### Target:

`Phone#phone1`
```JavaScript
{
  _id: 'phone1',
  owner: {
    _id: 'user1',
    name: 'User #1'
  },
  screens: [
    {
      screen: {
        _id: 'screen1',
        index: 1
      },
      apps: [
        {
          _id: 'app1',
          name: 'App #1'
        },
        {
          _id: 'app2',
          name: 'App #2'
        }
      ]
    },
    {
      screen: {
        _id: 'screen2',
        index: 2
      },
      apps: [
        {
          _id: 'app3',
          name: 'App #3'
        },
        {
          _id: 'app4',
          name: 'App #4'
        },
        {
          _id: 'app5',
          name: 'App #5'
        }
      ]
    }
  ]
}
```

#### Code:

```JavaScript
let phone1 = phoneCollection.get('phone1');
let app5 = phoneCollection.get('app5');
phoneCollection.update(phone, {
  screens: [{
    screen: {
      _id: 'screen2',
      index: 2
    },
    apps: [{
      _id: 'app5',
      name: 'App #5'
    }]
  }]
});
```

#### Request:

`HTTP - PUT - URL: api/phones/phone1`
```JSON
{
  "screens": [{
    "screen": {
      "_id": "screen2",
      "index": 2
    },
    "apps": [{
      "_id": "app5",
      "name": "App #5"
    }]
  }]
}
```

#### Response:

`content-type: application/json`
```JSON
{
  ???
}
```
