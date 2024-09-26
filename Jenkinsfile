pipeline {
  agent any

  environment {
    registry = "dockerartisan/nestjs-app"
    registryCredential = 'dockerhub-credentials'
    dockerImage = ''
  }

  stages {
    stage('Clone Git') {
      steps {
        git 'https://github.com/ab-hakim-ayman/offer-zone-devops.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          dockerImage = docker.build registry + ":$BUILD_NUMBER"
        }
      }
    }

    stage('Push Docker Image') {
      steps {
        script {
          docker.withRegistry('', registryCredential) {
            dockerImage.push()
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          kubernetesDeploy(kubeconfigId: 'kubeconfigId', configs: 'k8s/deployment.yaml')
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
