module.exports = {
  apps: [
    {
      name: "Account",
      script: "./Services/account.js",
      args: "",
      instances: 1,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Characters",
      script: "./Services/characters.js",
      args: "",
      instances: 1,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Equipment",
      script: "./Services/equipment.js",
      args: "",
      instances: 4,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Inventory",
      script: "./Services/inventory.js",
      args: "",
      instances: 4,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Core",
      script: "./Services/core.js",
      args: "",
      instances: 4,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Skills",
      script: "./Services/skills.js",
      args: "",
      instances: 4,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Event Router",
      script: "./Services/router.js",
      args: "",
      instances: 1,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Api",
      script: "./Api/initiator.js",
      args: "",
      instances: 1,
      autorestart: false,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
