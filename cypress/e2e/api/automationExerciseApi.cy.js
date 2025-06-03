describe('AutomationExercise API Testing', () => {
  const baseUrl = 'https://automationexercise.com'

    it('GET - All Products List', () => {
      cy.request(`${baseUrl}/api/productsList`).then((response) => {
        expect(response.status).to.eq(200)

        const body = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        expect(body).to.have.property('products')
        expect(body.products).to.be.an('array').and.not.be.empty
      })
    })

    it('POST - All Products List (should be rejected or return error)', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/productsList`,
        failOnStatusCode: false
      }).then((response) => {
        // Log response to investigate
        cy.log(JSON.stringify(response.body, null, 2))

        // Accept that status may be 200 but body should not contain valid products
        const body = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        expect(body).to.not.have.property('products') // Not expected in a POST
      })
    })

    it('GET - All Brands List', () => {
      cy.request(`${baseUrl}/api/brandsList`).then((response) => {
        expect(response.status).to.eq(200)

        const body = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        expect(body).to.have.property('brands')
        expect(body.brands).to.be.an('array').and.have.length.greaterThan(0)
      })
    })

    it('PUT - All Brands List (should not be allowed)', () => {
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/api/brandsList`,
        failOnStatusCode: false

      }).then((response) => {

        const body = typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body

      // If server returns 200 but includes an error message
      expect(body).to.have.property('responseCode').and.not.eq(200)
      })
    })

    it('POST - Search Product', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/searchProduct`,
        form: true,
        body: {
        search_product: 'tshirt'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)

      // 🛠 Parse the response body if it's a string
      const parsedBody = typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body

      expect(parsedBody).to.have.property('products')
      expect(parsedBody.products).to.be.an('array').that.is.not.empty
      })
    })

    it('POST - Search Product without parameter', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/searchProduct`,
        form: true,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200) // The API still returns 200 for some reason

        const parsedBody = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        // Now assert the API responded with an error message (even if HTTP status is 200)
        expect(parsedBody).to.have.property('responseCode').that.is.not.eq(200)
        expect(parsedBody).to.have.property('message').that.includes('missing')
      })
    })

     it('POST - Verify Login with valid details', () => {
       cy.request({
         method: 'POST',
         url: `${baseUrl}/api/verifyLogin`,
         form: true,
         body: {email: 'valid@example.com',
           password: 'validpassword'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(200)
          })
     })


     it('POST - Verify Login without email', () => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/api/verifyLogin`,
          form: true,
          body: {
            // no email or password
          },
          failOnStatusCode: false
        }).then((response) => {
          // The API responds with 200 even on failure
          expect(response.status).to.eq(200)

          const parsedBody = typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body

          expect(parsedBody).to.have.property('responseCode').that.is.not.eq(200)
          expect(parsedBody).to.have.property('message').that.includes('missing')
        })
     })


     it('DELETE - Verify Login (invalid method)', () => {
        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/api/verifyLogin`,
          failOnStatusCode: false
        }).then((response) => {
          // The API always returns 200, even on method errors
          expect(response.status).to.eq(200)

          const parsedBody = typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body

          expect(parsedBody).to.have.property('responseCode').that.is.not.eq(200)
          expect(parsedBody.message).to.include('method') // or whatever message the API returns
        })
     })

    it('POST - Verify Login with invalid details', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/verifyLogin`,
        form: true,
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200) // This API always returns 200
        const parsedBody = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        expect(parsedBody).to.have.property('message')
        expect(parsedBody.message.toLowerCase()).to.match(/not correct|user not found/)
      })
    })

    it('POST - Create/Register User Account', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/createAccount`,
        form: true,
        body: {
          name: 'QA Test',
          email: `qatest_${Date.now()}@example.com`,
          password: 'test123'
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
      })
    })

    it('DELETE - Delete User Account (expect failure without token/user)', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/deleteAccount`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200) // Accept that it returns 200

        // Handle string or object responses
        const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body

        expect(body).to.have.property('message')
      expect(body.message.toLowerCase()).to.include('email parameter is missing')
      })
    })




    it('PUT - Update User Account (invalid or placeholder)', () => {
      cy.request({
        method: 'PUT',
        url: 'https://automationexercise.com/api/updateAccount',
        body: {
          // Missing or invalid fields on purpose for test
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)

        // Manually parse the string to a JS object
        const body = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        expect(body).to.have.property('responseCode')
        expect(body.responseCode).to.not.eq(200) // This should be 400 or something else
        expect(body.message.toLowerCase()).to.include('missing') // or 'invalid'
      })
    })




    it('GET - User detail by email (likely fails without valid email)', () => {
      cy.request({
        method: 'PUT',
        url: 'https://automationexercise.com/api/updateAccount',
        failOnStatusCode: false,
        body: {
          // whatever you’re testing here
        }
      }).then((response) => {
        expect(response.status).to.eq(200)

        // ✅ NO need to parse
        const parsedBody = response.body

        expect(parsedBody).to.have.property('responseCode')
        expect(parsedBody.responseCode).to.not.eq(200)
      })
    })
})

