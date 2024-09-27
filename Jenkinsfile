pipeline {
    agent any
    environment {
        registry = "dockerartisan/offer-zone-devops"
        registryCredential = 'docker-credentials'
        dockerImage = ''
        kubeconfigId = 'kube-config'
    }
    stages {
        stage('Clone Repository') {
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
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    kubernetesDeploy(
                        kubeconfigId: kubeconfigId,
                        configs: 'k8s/nestjs-deployment.yaml',
                        enableConfigSubstitution: true
                    )
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
