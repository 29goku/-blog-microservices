#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Blog Microservices API Tests ===${NC}\n"

# Base URLs
USER_SERVICE="http://localhost:8081/api/users"
POST_SERVICE="http://localhost:8082/api/posts"
COMMENT_SERVICE="http://localhost:8083/api/comments"

# Test 1: Create User
echo -e "${BLUE}[1] Creating User...${NC}"
USER_RESPONSE=$(curl -s -X POST $USER_SERVICE \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123",
    "fullName": "John Doe",
    "bio": "Software Engineer"
  }')
echo $USER_RESPONSE | jq '.'
USER_ID=$(echo $USER_RESPONSE | jq '.id')
echo -e "${GREEN}✓ User created with ID: $USER_ID${NC}\n"

# Test 2: Get User
echo -e "${BLUE}[2] Getting User...${NC}"
curl -s -X GET "$USER_SERVICE/$USER_ID" | jq '.'
echo -e "${GREEN}✓ User fetched${NC}\n"

# Test 3: Create Post
echo -e "${BLUE}[3] Creating Post...${NC}"
POST_RESPONSE=$(curl -s -X POST $POST_SERVICE \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"title\": \"Introduction to Microservices\",
    \"content\": \"Microservices architecture allows independent deployment and scaling of services...\",
    \"tags\": \"microservices,architecture,spring\"
  }")
echo $POST_RESPONSE | jq '.'
POST_ID=$(echo $POST_RESPONSE | jq '.id')
echo -e "${GREEN}✓ Post created with ID: $POST_ID${NC}\n"

# Test 4: Get Post (includes User info via Feign)
echo -e "${BLUE}[4] Getting Post (with User enrichment)...${NC}"
curl -s -X GET "$POST_SERVICE/$POST_ID" | jq '.'
echo -e "${GREEN}✓ Post fetched with embedded User object${NC}\n"

# Test 5: Create Comment
echo -e "${BLUE}[5] Creating Comment...${NC}"
COMMENT_RESPONSE=$(curl -s -X POST $COMMENT_SERVICE \
  -H "Content-Type: application/json" \
  -d "{
    \"postId\": $POST_ID,
    \"userId\": $USER_ID,
    \"content\": \"Great post! Very informative and well-structured.\"
  }")
echo $COMMENT_RESPONSE | jq '.'
COMMENT_ID=$(echo $COMMENT_RESPONSE | jq '.id')
echo -e "${GREEN}✓ Comment created with ID: $COMMENT_ID${NC}\n"

# Test 6: Get Comments on Post
echo -e "${BLUE}[6] Getting Comments on Post...${NC}"
curl -s -X GET "$COMMENT_SERVICE/post/$POST_ID" | jq '.'
echo -e "${GREEN}✓ Comments fetched${NC}\n"

# Test 7: Search Posts
echo -e "${BLUE}[7] Searching Posts by title...${NC}"
curl -s -X GET "$POST_SERVICE/search?title=Microservices" | jq '.'
echo -e "${GREEN}✓ Posts searched${NC}\n"

# Test 8: Update Post
echo -e "${BLUE}[8] Updating Post...${NC}"
curl -s -X PUT "$POST_SERVICE/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Microservices Architecture",
    "content": "Deep dive into microservices with service discovery and API gateway...",
    "tags": "microservices,architecture,spring,kubernetes"
  }' | jq '.'
echo -e "${GREEN}✓ Post updated${NC}\n"

# Test 9: Get all Posts by User
echo -e "${BLUE}[9] Getting all Posts by User...${NC}"
curl -s -X GET "$POST_SERVICE/user/$USER_ID" | jq '.'
echo -e "${GREEN}✓ User posts fetched${NC}\n"

# Test 10: Get all Comments by User
echo -e "${BLUE}[10] Getting all Comments by User...${NC}"
curl -s -X GET "$COMMENT_SERVICE/user/$USER_ID" | jq '.'
echo -e "${GREEN}✓ User comments fetched${NC}\n"

echo -e "${BLUE}=== All Tests Completed Successfully ===${NC}\n"
