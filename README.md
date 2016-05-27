# S3 Volume Plugin For Docker

This is proof-of-concept code I wrote to learn how to write a docker volume plugin. It provides the ability to create
volumes which are backed by an S3 bucket.

**This is not production code!**

**__No, really, it's not__**

I put this together in less than a day to see if I could.

## Installation

I wrote and tested this on an Ubuntu machine with docker installed on it. Presuming you have one of those to hand, if
you wanted to convince yourself that this works you would do the following:

  * Create an AWS bucket
  * Create a user with access to that bucket, and download their credentials
  * Install s3fs
  * Create a global password config file with the AWS user's credentials
  * Clone this repo
  * Copy the contents of `conf/` to `/etc/systemd/system/`
  * `npm pack`

If you're like me, you'll have your npm config set up to install packages local to your user, instead of requiring sudo.
This POC code needs things to be installed globally, so switch to root and run:

  * `npm install -g forever`
  * `npm install -g ./s3-volume-plugin-1.0.0.tgz
  * `systemctl restart s3-volume`

## Creating an S3 Volume

You can now switch back to your mortal user and run something like this to create the volume:

  * `docker volume create -d s3-volume --name aws --opt bucket=<bucket name>`

It should echo you back the name you provided, and if you check `/var/log/syslog` you'll see some log output.

Now create a container to test it. I had the nginx one downloaded locally so I ran:

  * `docker run -it -v aws:/amazon nginx bash`

I then created a file within `/amazon` on the container and confirmed it was there using the AWS web console.
