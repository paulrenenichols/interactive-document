# Workflow Update 2026 March 04

- add a way to document progress in \_docs. we need to add a progress folder to \_docs. this progress folder should have a subfolder for each milestone, and a markdown document for each phase in the milestone describing the work that was done. as part of this effort, I would like you to look at the existing branches we have, since they are named after milestones and phases, and use that to generate progress documentation for completed work. for branches that are not related to milestones and phases, add a \_docs/progress/miscellaneous, with the document name being related to the branch name.

- add a planning folder to \_docs. the planning folder should have sub folders for each new milestone that we create. each folder should match our existing naming structure in our milestones folder. each milestones folder in planning should contain a project-overview folder and a definition folder. I would also like to move both the \_docs/setup folder into the planning folder, as well as the \_docs/definition folder. for the docs definition folder, put it under \_docs/planning/initial milestones. I would like feedback about whether it makes sense to reuse \_docs/setup/new-project-setup.md for generating future milestones, or if we need to create a separate setup prompt file that takes into account creating new milestones in a way that is parameratized so that it can be pointed at arbitrary new milestone plans.

- I would like to update \_docs/setup/new-project-setup.md, as well as the new milestone setup doc if we create one, to account for the changes that we are making here. project or new milestone setup documents should be updated to include directions to add instructions to phase plans to update progress documentation both when work is completed by the agent, as well as a final pass after it has been reviewed and approved by the user.

- finally, I would would like to update phase plans that we haven't worked on yet to match all new requirements that I am adding to the new project and milestone setup documentation.

- I'm adding an updates folder for adding prompt documents to define updates like this. if it makes sense, we should document that in our process somewhere.

- I would also like to add a readme.md to \_docs explaining the structure and the purpose of the included files and folders.
