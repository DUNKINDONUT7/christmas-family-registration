// Admin Dashboard Functions

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(tabName).classList.add("active")
  event.target.classList.add("active")
}

function openEditModal(familyId, familyName, members) {
  document.getElementById("editFamilyId").value = familyId
  document.getElementById("editFamilyName").value = familyName
  document.getElementById("editMemberCount").value = members.length

  document.getElementById("editMemberCount").dispatchEvent(new Event("change"))

  const inputs = document.querySelectorAll("#editMembersContainer input")
  members.forEach((member, index) => {
    if (inputs[index]) {
      inputs[index].value = member
    }
  })

  document.getElementById("editModal").style.display = "block"
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none"
}

document.getElementById("editMemberCount")?.addEventListener("change", function () {
  const count = Number.parseInt(this.value)
  const container = document.getElementById("editMembersContainer")
  container.innerHTML = ""

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input")
    input.type = "text"
    input.name = "members[]"
    input.className = "member-input"
    input.placeholder = `Member ${i} Name`
    input.style.marginBottom = "10px"
    container.appendChild(input)
  }
})

function approveFamily(familyId) {
  if (confirm("Approve this family?")) {
    const formData = new FormData()
    formData.append("family_id", familyId)

    fetch("api_approve_family.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Family approved successfully!")
          location.reload()
        }
      })
  }
}

function deleteFamily(familyId) {
  if (confirm("Delete this family? This cannot be undone.")) {
    const formData = new FormData()
    formData.append("family_id", familyId)

    fetch("api_delete_family.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Family deleted successfully!")
          location.reload()
        }
      })
  }
}

function saveFamily(event) {
  event.preventDefault()

  const formData = new FormData(document.getElementById("editForm"))

  fetch("api_update_family.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Family updated successfully!")
        closeEditModal()
        location.reload()
      }
    })
}

function saveItinerary(event) {
  event.preventDefault()

  const formData = new FormData(document.getElementById("itineraryForm"))

  fetch("api_update_itinerary.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Itinerary saved successfully!")
        location.reload()
      }
    })
}

// Search functionality
document.getElementById("searchInput")?.addEventListener("keyup", function () {
  const searchTerm = this.value.toLowerCase()
  const rows = document.querySelectorAll(".family-row")

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(searchTerm) ? "" : "none"
  })
})

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById("editModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
