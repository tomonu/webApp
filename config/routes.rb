Rails.application.routes.draw do
  devise_for :users
  root 'lyrics#index'
  resources :lyrics, only: :create

  get 'lyrics/add' => 'lyrics#add'
end
