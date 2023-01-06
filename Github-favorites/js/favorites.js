import { GithubUser } from './githubuser.js'
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }
  notUser() {}

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table .fav')

    this.update()
    this.onadd()
  }

  onadd() {
    const userSearch = this.root.querySelector('.search button')
    const inputSearch = this.root.querySelector('#input-search')

    inputSearch.onkeypress = keyPressed => {
      if (keyPressed.key === 'Enter' || userSearch.click === 'onclick') {
        const { value } = this.root.querySelector('#input-search')

        this.add(value)
      }
    }
    userSearch.onclick = () => {
      const { value } = this.root.querySelector('#input-search')
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `${'/' + user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
        if (this.entries.length === 0) {
          this.root.querySelector('.noFav').classList.remove('hide')
        }
      }

      this.tbody.append(row)
    })
  }
  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
  <td class="user">
    <img
      src="https://github.com/franciscozufi.png"
      alt="Imagem de Francisco"
    />
    <a href="https://github.com/franciscozufi" target="_blank">
      <p>Francisco Zufi</p>
      <span>franciscozufi</span>
    </a>
  </td>
  <td class="repositories">18</td>
  <td class="followers">2</td>
  <td>
    <button class="remove">Remover</button>
  </td>
  `
    return tr
  }
  removeAllTr() {
    if (this.entries.length !== 0) {
      this.root.querySelector('.noFav').classList.add('hide')
    }
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
