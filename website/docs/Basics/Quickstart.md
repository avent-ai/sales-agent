---
sidebar_position: 2

---


# Deployment Guide

## Run an Example AI Sales agent
If you used a local installation of SallySalesBuddy skip the next two steps and directly run the run.py script:

`git clone https://github.com/AVENT-AI/SallySalesBuddy.git`

`cd SallySalesBuddy`

`python run.py --verbose True --config examples/example_agent_setup.json`

from your terminal.

## Test your setup

1. Activate your environment as described above. (run `source env/bin/activate` on Unix-like systems and `.\env\Scripts\activate` on Windows. Replace *env* with the name of your virtual environment)
2. cd `SallySalesBuddy`      If you haven't already navigated to the SallySalesBuddy home directory
3. `make test`

All tests should pass. Warnings can be ignored.

## Uninstall SallySalesBuddy

To delete the virtual environment you used for SallySalesBuddy programming and your SallySalesBuddy repository from your system navigate to the directory where you installed your virtual environment and cloned SallySalesBuddy and run:
`make clean`

## Deploy

We have a SallySalesBuddy deployment demo via FastAPI.

Please refer to [README-api.md](https://github.com/AVENT-AI/SallySalesBuddy/blob/main/README-api.md) for instructions!
