
pipeline {
  agent {
    dockerfile {
      filename 'Dockerfile.ci'
      args '-v /etc/group:/etc/group:ro ' +
           '-v /etc/passwd:/etc/passwd:ro ' +
           '-v /var/lib/jenkins:/var/lib/jenkins ' +
           '-v /usr/bin/docker:/usr/bin/docker:ro ' +
           '--network=host ' +
		   "--name=forgae-${env.BUILD_NUMBER}"
    }
  }

  stages {
    stage('Build') {
      steps {
        sh 'ln -sf /node_modules ./'
        sh 'pnpm run build'
      }
    }

    stage('Test') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'genesis-wallet',
                                          usernameVariable: 'WALLET_PUB',
                                          passwordVariable: 'WALLET_PRIV')]) {
          sh 'npm test'
        }
      }
    }
  }

  post {
    always {
      junit 'test-results.xml'
      archive 'dist/*'
      sh "docker stop forgae-${env.BUILD_NUMBER}"
	  sh "docker rm forgae-${env.BUILD_NUMBER}"

    }
  }
}