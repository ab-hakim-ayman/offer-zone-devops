pipeline {
    agent any

    environment {
        registry = "dockerartisan/nestjs-app"
        registryCredential = 'docker-credentials'
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
                    kubernetesDeploy(kubeconfigId: 'kube-config', configs: 'k8s/nestjs-deployment.yaml')
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
