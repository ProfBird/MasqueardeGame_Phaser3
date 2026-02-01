# GAME REQUIREMENTS SPECIFICATION: The Solarpunk Masquerade

## 1. Game Overview
**Title:** The Solarpunk Masquerade
**Genre:** Top-Down Social Deduction / Puzzle
**Perspective:** 2.5D Top-Down (Bird's Eye View)
**Visual Style:** "Paper Doll" Aesthetic in a Solarpunk setting (Art Nouveau meets Green Technology).

**Concept:**
The player takes on the role of a detective attending a high-society masquerade ball in a futuristic, utopian city. A notorious jewel thief is hiding among the guests. The player is given one specific visual feature of the thief (the "Clue"). The player must navigate the ballroom, momentarily "unmask" guests to reveal their faces, and identify the thief before the timer runs out.

---

## 2. Visual & Audio Setting
### 2.1. The Environment (The Ballroom)
* **Architecture:** A massive glass-domed atrium with brass structures and Art Nouveau curves.
* **Lighting:** Natural sunlight filtering through stained glass (or bioluminescent plants if set at night).
* **Decor:** Vertical gardens climbing the walls, water features functioning as cooling systems, and furniture made of living wood or polished amber.

### 2.2. The Characters (Guests)
* **Style:** Characters appear as 2D "Paper Cutouts" with white borders.
* **Attire:** High-fashion Solarpunk—Victorian silhouettes made of organic fabrics (linen, silk) accented with brass gears, solar-collection filigree, and leather straps.
* **Masks:** Ornate masks made of wood, brass, or glowing circuitry that completely obscure the upper face.

---

## 3. Gameplay Mechanics

### 3.1. The Setup (Game Start)
* **Randomization:** Upon starting a new game, the system spawns 10–15 guests.
* **Identity Assignment:**
    * Every guest is assigned a random face (Eye color, hair color, distinct markings).
    * Every guest is assigned a random mask and outfit.
    * **One** guest is secretly designated as the **Target (Thief)**.
* **The Briefing:** The player is shown a digital "Wanted Poster" displaying **one** unchangeable facial feature of the thief (e.g., *"Suspect has bright green eyes"* or *"Suspect has a scar on their left cheek"*).

### 3.2. Player Movement & Controls
* **Movement:** The player moves freely around the ballroom using keyboard controls (WASD or Arrow Keys).
* **Collision:** The player cannot walk through guests or furniture; they must navigate the crowd.
* **Interaction Zone:** When the player is within close proximity to a guest, a UI prompt appears (e.g., a magnifying glass icon or "PRESS SPACE").

### 3.3. The "Unmasking" Mechanic
This is the core interaction loop. The player cannot see a guest's face until they trigger this event.
1.  **Initiation:** The player approaches a guest and presses the **Interact Key**.
2.  **Animation:**
    * The guest stops moving.
    * The guest's arm rotates upward to hold their mask.
    * The mask is physically lifted away from the face (or momentarily turns transparent/invisible).
3.  **The Reveal:** The face is visible for exactly **2.0 seconds**. The player must visually confirm if the face matches the clue.
4.  **Reaction:** The guest plays a "Surprised" animation (e.g., a slight jump or gasp) while unmasked.
5.  **Reset:** After 2 seconds, the arm lowers, the mask returns to cover the face, and the guest resumes wandering.

### 3.4. Accusation & Win/Loss States
* **To Accuse:** While a guest is currently unmasked (during the 2-second window), the player presses a secondary **Accuse Key** (e.g., Enter).
* **Win Condition:**
    * If the accused guest **IS** the Thief:
    * **Outcome:** The music shifts to a fanfare. The thief is handcuffed. A "Mission Accomplished" screen appears showing the thief's full profile.
* **Loss Condition A (Wrong Guess):**
    * If the accused guest **IS NOT** the Thief:
    * **Outcome:** The guest looks offended. A "Social Faux Pas!" screen appears. The thief escapes in the confusion. Game Over.
* **Loss Condition B (Time Out):**
    * A global timer (e.g., 2 minutes) counts down.
    * **Outcome:** If the timer hits 0:00, the lights go out, and the jewels are stolen. Game Over.

---

## 4. NPC (Non-Player Character) Behavior
* **Wandering:** Guests do not stand still. They pick random locations in the ballroom and walk toward them at varying speeds.
* **Idling:** Upon reaching a destination, a guest waits for a random duration (3–5 seconds) before moving again.
* **Socializing:** If two guests bump into each other, they may pause to "face" each other for a moment (simulating conversation) before moving on.
* **Visual Wobble:** To emphasize the "Paper Doll" aesthetic, guests do not have animated legs. Instead, they slightly rotate left/right (waddle) as they move across the floor.

---

## 5. User Interface (UI) Requirements
### 5.1. HUD (Heads-Up Display)
* **The Clue:** Permanently displayed in the top-left or bottom-left corner (e.g., *"LOOK FOR: Green Eyes"*).
* **The Timer:** A digital countdown clock displayed prominently at the top center.

### 5.2. World UI
* **Highlight:** When the player is close enough to unmask a guest, the guest (or the interaction button) should have a subtle glowing outline to indicate they are interactive.

---

## 6. Asset Requirements Summary
* **Player Character:** 1 distinctive avatar.
* **Guest Variations:**
    * **Bodies:** 3–4 variations of Solarpunk formal wear (male/female/androgynous).
    * **Heads:** 5+ variations with distinct features (Green eyes, Blue eyes, Brown eyes, Glasses, Scar, etc.).
    * **Masks:** 3–4 distinct mask designs.
* **Environment:**
    * Floor tile (seamless parquet or marble).
    * Obstacles (Tables, plants, fountains).

---

## 7. Implementation Notes (Phaser)
### 7.1. Physics & Collision
* Arcade Physics body `x/y` are **top-left**; use `body.center` for distance/proximity checks.
* `overlap()` only detects contact; it does **not** resolve penetration. `collider()` resolves penetration.
* If using proximity-based collision, compute using **combined radii** from body sizes and body centers.

### 7.2. Debug & Feature Flags
* Debug tooling (physics overlays, console API) is gated by `NODE_ENV !== 'production'`.
* Placeholder graphics are feature-flagged (see `FEATURE_FLAGS.enablePlaceholderGraphics`).

### 7.3. Current Collision Approach
* Player↔Guest uses overlap + manual separation + proximity blocking.
* Proximity and overlap use body centers + combined radii for consistent calculations.