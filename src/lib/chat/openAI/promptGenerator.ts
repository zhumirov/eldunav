import { pool } from "@/lib/postgres";

export async function generatePrompt(code: string): Promise<string> {
  try {
    // Query the 'jobs' table
    const jobQuery = "SELECT * FROM jobs WHERE job_id = $1 LIMIT 1";
    const jobValues = [code];
    const jobResult = await pool.query(jobQuery, jobValues);

    if (jobResult.rows.length === 0) {
      throw new Error("No matching record found");
    }

    // Extract the job data and job_id
    const jobData = jobResult.rows[0];
    const job_id = jobData.job_id;

    // Fetch category data and replace 'category_id' with category name
    if (jobData.category_id) {
      const categoryQuery = "SELECT name FROM categories WHERE id = $1";
      const categoryResult = await pool.query(categoryQuery, [
        jobData.category_id,
      ]);

      if (categoryResult.rows.length > 0) {
        const categoryData = categoryResult.rows[0];
        jobData.category = categoryData.name; // Replace 'category_id' with 'name'
        delete jobData.category_id; // Optionally delete 'category_id' from jobData
      } else {
        jobData.category = null; // If category not found, set to null
        delete jobData.category_id;
      }
    }

    // Define queries for related tables with ordering and limits
    const queries = [
      {
        name: "abilities",
        query:
          "SELECT abilities FROM jobs_abilities WHERE job_id = $1 ORDER BY importance DESC LIMIT 5",
        column: "abilities",
      },
      {
        name: "activities",
        query:
          "SELECT activity FROM jobs_activities WHERE job_id = $1 ORDER BY importance DESC LIMIT 5",
        column: "activity",
      },
      {
        name: "knowledge",
        query:
          "SELECT knowledge FROM jobs_knowledge WHERE job_id = $1 ORDER BY importance DESC LIMIT 5",
        column: "knowledge",
      },
      {
        name: "skills",
        query: "SELECT skill FROM jobs_skills WHERE job_id = $1",
        column: "skill",
      },
      {
        name: "specs",
        query:
          "SELECT spec_id, code, group_name, name, subjects, count FROM specs WHERE spec_id IN (SELECT spec_id FROM jobs_specs WHERE job_id = $1)",
        column: null, // We'll handle specs separately
      },
      {
        name: "tasks",
        query:
          "SELECT task FROM jobs_tasks WHERE job_id = $1 ORDER BY importance DESC LIMIT 5",
        column: "task",
      },
      {
        name: "technology",
        query: "SELECT value FROM jobs_technology WHERE job_id = $1",
        column: "value",
      },
      {
        name: "tools",
        query: "SELECT tools FROM jobs_tools WHERE job_id = $1",
        column: "tools",
      },
      {
        name: "values",
        query:
          "SELECT value FROM jobs_values WHERE job_id = $1 ORDER BY percent DESC LIMIT 5",
        column: "value",
      },
    ];

    // Execute queries in parallel
    const queryPromises = queries.map(async (item) => {
      try {
        if (item.name === "specs") {
          // Special handling for specs
          const result = await pool.query(item.query, [job_id]);
          const specsData = result.rows;

          // For each spec, fetch data from specs_univers
          const specsWithUniversPromises = specsData.map(async (spec) => {
            const universQuery =
              "SELECT * FROM specs_univers WHERE spec_id = $1";
            const universResult = await pool.query(universQuery, [
              spec.spec_id,
            ]);

            // Filter universities where count_grant_gen_2023 >= 5
            const filteredUniversities = universResult.rows.filter((univer) => {
              let countGrantGen = univer.count_grant_gen_2023;

              if (countGrantGen === null || countGrantGen === undefined) {
                return false; // Exclude if count_grant_gen_2023 is null or undefined
              }

              if (typeof countGrantGen === "string") {
                // Convert string to number
                countGrantGen = Number(countGrantGen.replace(/,/g, ""));
              }

              // Ensure countGrantGen is a number
              if (typeof countGrantGen !== "number" || isNaN(countGrantGen)) {
                return false; // Exclude if not a valid number
              }

              return countGrantGen >= 5;
            });

            // Collect all univer_ids
            const univerIds = filteredUniversities.map(
              (univer) => univer.univer_id
            );

            if (univerIds.length > 0) {
              // Remove duplicates
              const uniqueUniverIds = [...new Set(univerIds)];

              // Prepare the query
              const placeholders = uniqueUniverIds
                .map((_, index) => `$${index + 1}`)
                .join(",");
              const univerDetailsQuery = `SELECT * FROM univers WHERE univer_id IN (${placeholders})`;

              let univerDetailsResult;
              try {
                univerDetailsResult = await pool.query(
                  univerDetailsQuery,
                  uniqueUniverIds
                );
              } catch (err) {
                console.error(`Error querying univers table:`, err);
                univerDetailsResult = { rows: [] }; // Use empty array if query fails
              }

              // Create a mapping from univer_id to university details
              const univerDetailsMap = new Map();
              univerDetailsResult.rows.forEach((univerDetails) => {
                univerDetailsMap.set(univerDetails.univer_id, univerDetails);
              });

              // Merge university details into filteredUniversities
              const universitiesWithDetails = filteredUniversities.map(
                (univer) => {
                  const details = univerDetailsMap.get(univer.univer_id);
                  if (details) {
                    return { ...univer, ...details };
                  } else {
                    return univer;
                  }
                }
              );

              // Assign the updated universities array to spec.universities
              spec.universities = universitiesWithDetails;
            } else {
              // No universities to process
              spec.universities = [];
            }

            return spec;
          });

          // Wait for all specs with universities data to be fetched
          const specsWithUnivers = await Promise.all(specsWithUniversPromises);

          return { specs: specsWithUnivers };
        } else {
          const result = await pool.query(item.query, [job_id]);
          // Extract the desired column values into an array
          const values = result.rows.map((row) => row[item.column as any]);
          return { [item.name]: values };
        }
      } catch (err) {
        console.error(`Error querying ${item.name}:`, err);
        return { [item.name]: [] }; // Return empty array on error
      }
    });

    // Wait for all queries to complete
    const queryResults = await Promise.all(queryPromises);

    // Merge the additional data into jobData
    queryResults.forEach((result) => {
      Object.assign(jobData, result);
    });

    // Clean up the 'technology' array to remove unwanted parts
    if (Array.isArray(jobData.technology)) {
      jobData.technology = jobData.technology.map((techString: string) => {
        // Find the index of ',/' where the unwanted part starts
        const index = techString.indexOf(",/");
        if (index !== -1) {
          // Remove substring starting from ',/' to the end
          return techString.substring(0, index);
        } else {
          // No unwanted part found, return the original string
          return techString;
        }
      });
    }

    // Process 'median_wage': Divide by 120, multiply by 500, round to nearest 10000
    if (jobData.median_wage != null) {
      let medianWage = Number(jobData.median_wage);
      if (!isNaN(medianWage)) {
        medianWage = (medianWage / 120) * 500;
        medianWage = Math.round(medianWage / 10000) * 10000;
        jobData.median_wage = medianWage;
      }
    }

    // Process 'job_openings': Remove commas, divide by 20, round to nearest 100
    if (jobData.job_openings != null) {
      // Remove commas and parse number
      let jobOpenings = Number(
        jobData.job_openings.toString().replace(/,/g, "")
      );
      if (!isNaN(jobOpenings)) {
        jobOpenings = jobOpenings / 20;
        jobOpenings = Math.round(jobOpenings / 100) * 100;
        jobData.job_openings = jobOpenings;
      }
    }

    // Process 'emloyees': Remove commas, divide by 20, round to nearest 100
    if (jobData.emloyees != null) {
      let employees = Number(jobData.emloyees.toString().replace(/,/g, ""));
      if (!isNaN(employees)) {
        employees = employees / 20;
        employees = Math.round(employees / 100) * 100;
        jobData.emloyees = employees;
      }
    }

    // **Filtering jobData to include only specified keys**
    // List of keys to keep at the jobData level
    const jobDataKeysToKeep = [
      "prep_needed",
      "education",
      "related_experience",
      "job_training",
      "median_wage",
      "employment_growth",
      "job_openings",
      "emloyees",
      "group_name",
      "name",
      "featured",
      "abilities",
      "activities",
      "knowledge",
      "skills",
      "tasks",
      "technology",
      "tools",
      "values",
      "specs",
    ];

    // Filter jobData
    const filteredJobData: any = {};
    for (const key of jobDataKeysToKeep) {
      if (jobData[key] !== undefined) {
        filteredJobData[key] = jobData[key];
      }
    }

    // Process 'specs' to filter keys in each spec
    if (Array.isArray(filteredJobData.specs)) {
      filteredJobData.specs = filteredJobData.specs.map((spec: any) => {
        const specKeysToKeep = [
          "code",
          "group_name",
          "name",
          "subjects",
          "count",
          "universities",
        ];
        const filteredSpec: any = {};
        for (const key of specKeysToKeep) {
          if (spec[key] !== undefined) {
            filteredSpec[key] = spec[key];
          }
        }
        // Process 'universities' within each spec
        if (Array.isArray(filteredSpec.universities)) {
          filteredSpec.universities = filteredSpec.universities.map(
            (univer: any) => {
              const univerCopy = { ...univer };
              // Remove 'id', 'spec_id', 'univer_id' from university object
              delete univerCopy.id;
              delete univerCopy.spec_id;
              delete univerCopy.univer_id;
              return univerCopy;
            }
          );
        }
        return filteredSpec;
      });
    }

    // **Generate the prompt text using the filteredJobData**
    // Implementing the context provided

    const promptLines: string[] = [];

    // Occupation and Industry Group
    promptLines.push(`**Career Overview: ${filteredJobData.name}**\n`);
    promptLines.push(`**Occupation:** ${filteredJobData.name}`);
    promptLines.push(`**Industry Group:** ${filteredJobData.group_name}`);
    if (filteredJobData.featured) {
      promptLines.push(
        `**Featured Occupation:** This occupation is gaining popularity.`
      );
    }

    promptLines.push(`\n---\n`);

    // Education and Preparation Needed
    const prepLevelDescriptions: { [key: string]: string } = {
      "1": "No preparation needed",
      "2": "Low preparation needed",
      "3": "Medium preparation needed",
      "4": "Good preparation needed",
      "5": "Extensive preparation needed",
    };

    const prepNeededDescription =
      prepLevelDescriptions[filteredJobData.prep_needed] ||
      "Unknown preparation level";
    promptLines.push(
      `Return text very short. Just most important moments. It is very important. Text should be super short. only most imporant moments. Return your response only in KAzakh or Russian. Depends on what language question is asked. By default return in Russian.`
    );
    promptLines.push(`**Education and Preparation Needed:**\n`);
    promptLines.push(
      `This occupation requires a **${prepNeededDescription}**.`
    );
    if (filteredJobData.education) {
      promptLines.push(`- **Education:** ${filteredJobData.education}`);
    }
    if (filteredJobData.related_experience) {
      promptLines.push(
        `- **Related Experience:** ${filteredJobData.related_experience}`
      );
    }
    if (filteredJobData.job_training) {
      promptLines.push(`- **Job Training:** ${filteredJobData.job_training}`);
    }

    promptLines.push(`\n---\n`);

    // Income and Employment Outlook
    promptLines.push(`**Income and Employment Outlook:**\n`);
    if (filteredJobData.median_wage !== undefined) {
      promptLines.push(
        `- **Median Wage:** Approximately **${filteredJobData.median_wage} Kazakhstani Tenge**.`
      );
    }
    if (filteredJobData.employment_growth) {
      promptLines.push(
        `- **Employment Growth:** ${filteredJobData.employment_growth}`
      );
    }
    if (filteredJobData.job_openings !== undefined) {
      promptLines.push(
        `- **Job Openings:** About **${filteredJobData.job_openings}** positions available.`
      );
    }
    if (filteredJobData.emloyees !== undefined) {
      promptLines.push(
        `- **Number of Employees:** Around **${filteredJobData.emloyees}** individuals are employed in this occupation.`
      );
    }

    promptLines.push(`\n---\n`);

    // Abilities
    if (
      Array.isArray(filteredJobData.abilities) &&
      filteredJobData.abilities.length > 0
    ) {
      promptLines.push(`**Key Abilities:**\n`);
      filteredJobData.abilities.forEach((ability: string) => {
        // Remove 'Related occupations' from each ability
        const abilityClean = ability.replace(/ Related occupations$/, "");
        promptLines.push(`- ${abilityClean}`);
      });
      promptLines.push(`\n---\n`);
    }

    // Activities
    if (
      Array.isArray(filteredJobData.activities) &&
      filteredJobData.activities.length > 0
    ) {
      promptLines.push(`**Main Activities:**\n`);
      filteredJobData.activities.forEach((activity: string) => {
        const activityClean = activity.replace(/ Related occupations$/, "");
        promptLines.push(`- ${activityClean}`);
      });
      promptLines.push(`\n---\n`);
    }

    // Knowledge Areas
    if (
      Array.isArray(filteredJobData.knowledge) &&
      filteredJobData.knowledge.length > 0
    ) {
      promptLines.push(`**Essential Knowledge Areas:**\n`);
      filteredJobData.knowledge.forEach((knowledge: string) => {
        const knowledgeClean = knowledge.replace(/ Related occupations$/, "");
        promptLines.push(`- ${knowledgeClean}`);
      });
      promptLines.push(`\n---\n`);
    }

    // Skills
    if (
      Array.isArray(filteredJobData.skills) &&
      filteredJobData.skills.length > 0
    ) {
      promptLines.push(`**Critical Skills:**\n`);
      const skillsToShow = filteredJobData.skills.slice(0, 5);
      skillsToShow.forEach((skill: string) => {
        const skillClean = skill.replace(/ Related occupations$/, "");
        promptLines.push(`- ${skillClean}`);
      });
      if (filteredJobData.skills.length > 5) {
        promptLines.push(
          `*Additional skills include ${
            filteredJobData.skills.length - 5
          } more skills.*`
        );
      }
      promptLines.push(`\n---\n`);
    }

    // Tasks
    if (
      Array.isArray(filteredJobData.tasks) &&
      filteredJobData.tasks.length > 0
    ) {
      promptLines.push(`**Common Tasks:**\n`);
      filteredJobData.tasks.forEach((task: string) => {
        const taskClean = task.replace(/ Related occupations$/, "");
        promptLines.push(`- ${taskClean}`);
      });
      promptLines.push(`\n---\n`);
    }

    // Technology and Tools
    promptLines.push(`**Technology and Tools Used:**\n`);
    if (
      Array.isArray(filteredJobData.technology) &&
      filteredJobData.technology.length > 0
    ) {
      promptLines.push(
        `- **Software:** ${filteredJobData.technology
          .join(", ")
          .replace(/ Related occupations/g, "")}.`
      );
    }
    if (
      Array.isArray(filteredJobData.tools) &&
      filteredJobData.tools.length > 0
    ) {
      promptLines.push(
        `- **Hardware:** ${filteredJobData.tools
          .join(", ")
          .replace(/ Related occupations/g, "")}.`
      );
    }

    promptLines.push(`\n---\n`);

    // Work Values
    if (
      Array.isArray(filteredJobData.values) &&
      filteredJobData.values.length > 0
    ) {
      promptLines.push(`**Work Values:**\n`);
      filteredJobData.values.forEach((value: string) => {
        const valueClean = value.replace(/ Related occupations$/, "");
        promptLines.push(`- ${valueClean}`);
      });
      promptLines.push(`\n---\n`);
    }

    // Educational Pathways in Kazakhstan
    if (
      Array.isArray(filteredJobData.specs) &&
      filteredJobData.specs.length > 0
    ) {
      promptLines.push(`**Educational Pathways in Kazakhstan:**\n`);
      promptLines.push(
        `To pursue this career, consider the following university specializations:\n`
      );
      filteredJobData.specs.forEach((spec: any) => {
        promptLines.push(`### **Specialization: ${spec.name}**`);
        promptLines.push(`- **Code:** ${spec.code}`);
        promptLines.push(`- **Group Name:** ${spec.group_name}`);
        promptLines.push(`- **Required Subjects for ЕНТ:** ${spec.subjects}`);
        promptLines.push(`- **Scholarships Last Year:** ${spec.count}`);
        if (Array.isArray(spec.universities) && spec.universities.length > 0) {
          promptLines.push(`\n**Universities Offering This Specialization:**`);
          spec.universities.forEach((univer: any, index: number) => {
            promptLines.push(
              `\n${index + 1}. **${univer.name_ru} (${univer.abbreviation})**`
            );
            promptLines.push(`   - **Code:** ${univer.code}`);
            promptLines.push(`   - **Location:** ${univer.address}`);
            promptLines.push(`   - **Region:** ${univer.region_name}`);
            promptLines.push(
              `   - **University Type:** ${univer.university_type}`
            );
            promptLines.push(`   - **Website:** ${univer.website}`);
            promptLines.push(`   - **Social Media:** ${univer.social}`);
            promptLines.push(
              `   - **Contact:** ${univer.phone1}${
                univer.phone2 ? ", " + univer.phone2 : ""
              }`
            );
            promptLines.push(
              `   - **English Program Availability:** ${
                univer.is_english_available === "yes" ? "Yes" : "No"
              }`
            );
            promptLines.push(`   - **Scholarships:** ${univer.min_grant}`);
            promptLines.push(
              `   - **Minimum ЕНТ Score for General Scholarship:** ${univer.min_point_gen_2023}`
            );
            promptLines.push(
              `   - **General Scholarships Available:** ${univer.count_grant_gen_2023}`
            );
            promptLines.push(
              `   - **Minimum ЕНТ Score for Rural Quota Scholarship:** ${univer.min_point_aul_2023}`
            );
            promptLines.push(
              `   - **Rural Quota Scholarships Available:** ${univer.count_grant_aul_2023}`
            );
            promptLines.push(`   - **Teacher Quota:** ${univer.teacher_quota}`);
            promptLines.push(`   - **Serpin Quota:** ${univer.serpin_quota}`);
            promptLines.push(
              `   - **Military Education Included:** ${univer.military_factory}`
            );
            promptLines.push(
              `   - **Dormitory Available:** ${univer.dormitory}`
            );
          });
        }
        promptLines.push(`\n`);
      });
      promptLines.push(`---\n`);
    }

    // Additional Notes
    promptLines.push(`**Additional Notes:**\n`);
    promptLines.push(`- **Preparation Level:** ${prepNeededDescription}.`);
    promptLines.push(
      `- **Median Wage:** The median wage is provided in Kazakhstani Tenge.`
    );
    if (filteredJobData.featured) {
      promptLines.push(
        `- **Featured Occupation:** This occupation is gaining popularity.`
      );
    }
    promptLines.push(
      `- **Educational Pathways:** Understanding the necessary subjects for the ЕНТ exam and the universities offering relevant programs can guide prospective students.`
    );
    promptLines.push(
      `- **University Quotas and Facilities:** Information about teacher quotas, Serpin quotas, military education, and dormitory availability is provided.`
    );
    promptLines.push(`\n---\n`);

    // Conclusion
    promptLines.push(`**Conclusion:**\n`);
    promptLines.push(
      `A career as a ${
        filteredJobData.name
      } combines knowledge in ${filteredJobData.group_name.toLowerCase()} with essential skills and abilities. With a strong employment outlook and available educational pathways in Kazakhstan, this occupation offers promising opportunities for those interested in this field.`
    );

    // Join all lines into a single prompt text
    const promptText = promptLines.join("\n");

    // Return the prompt text
    return promptText;
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}