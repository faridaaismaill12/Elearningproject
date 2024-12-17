import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from pathlib import Path

current_dir = Path(__file__).resolve().parent 
project_root = current_dir.parents[4]
csv_file_path = project_root / 'exported_data.csv'

# Read CSV
try:
    df = pd.read_csv(csv_file_path)
    print(df)
except FileNotFoundError:
    print(f"Could not find CSV file at: {csv_file_path}")

# Clean user IDs and parse the course IDs from CSV column
df['UserID'] = df['UserID'].str.replace('UserID: ', '').str.strip()
df['CourseIDs'] = df['CourseIDs'].fillna("").apply(lambda x: x.split(', '))

# Map users and courses to indices
user_ids = list(df['UserID'].unique())
course_ids = list({course for courses in df['CourseIDs'] for course in courses})

user_id_to_index = {user_id: i for i, user_id in enumerate(user_ids)}
course_id_to_index = {course_id: i for i, course_id in enumerate(course_ids)}
index_to_course_id = {i: course_id for course_id, i in course_id_to_index.items()}

# Create user-item interaction matrix
user_item_matrix = np.zeros((len(user_ids), len(course_ids)))

for idx, row in df.iterrows():
    user_idx = user_id_to_index[row['UserID']]
    for course_id in row['CourseIDs']:
        if course_id in course_id_to_index:
            course_idx = course_id_to_index[course_id]
            user_item_matrix[user_idx, course_idx] = 1  # Mark enrollment

# Apply SVD to the user-item matrix
num_components = 5  # Number of latent features
svd = TruncatedSVD(n_components=num_components, random_state=42)
latent_user_features = svd.fit_transform(user_item_matrix)
latent_course_features = svd.components_.T


# Function to generate recommendations
def recommend_courses(user_id, num_recommendations=3):
    if user_id not in user_id_to_index:
        raise ValueError(f"UserID '{user_id}' not found in data.")
    
    user_idx = user_id_to_index[user_id]
    
    # Compute scores for latent space
    user_latent_vector = latent_user_features[user_idx]
    scores = np.dot(latent_course_features, user_latent_vector)  # Fix alignment
    
    # Exclude already enrolled courses
    enrolled_courses = set(
        course_id_to_index[course]
        for course in df[df['UserID'] == user_id]['CourseIDs'].iloc[0]
    )
    
    ranked_courses = np.argsort(scores)[::-1]  # Sort by score
    recommended_courses = [
        index_to_course_id[idx]
        for idx in ranked_courses
        if idx not in enrolled_courses
    ]
    
    return recommended_courses[:num_recommendations]

# Example: Generate recommendations for a given user
user_to_recommend = "6752f538d1b4fe8613bcf5d5"  # This should now match cleaned data
recommended = recommend_courses(user_to_recommend , num_recommendations = 3)
print(f"Recommended courses for user {user_to_recommend}: {recommended}")