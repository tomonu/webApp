class LyricsController < ApplicationController
  def index
    @test = []
#    @list = Lyly.all().limit(1)
    @list = Lyly.where.not("lyric = ''")
    @rank = Lyly.where.not("lyric = ''").order("points DESC")
    gon.list = @list
    gon.rank = @rank
  end

  def add
  end

  def create
    Lyly.create(lyly_params)
  end

  private
  def lyly_params
    params.permit(:lyric,:title,:artist,:sex,:genre,:points)
  end
end
